"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { restoreServicesBatchAction, deleteServicesBatchAction } from "@/app/provider/actions";
import { Trash2, RotateCcw, AlertCircle, Check, Loader2 } from "lucide-react";
import Image from "next/image";
import Swal from 'sweetalert2';

// Configuração dos Toasts (Notificações rápidas)
const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer)
    toast.addEventListener('mouseleave', Swal.resumeTimer)
  }
});

interface TrashListProps {
  items: any[];
  onRefresh: () => Promise<void> | void;
}

export default function TrashList({ items, onRefresh }: TrashListProps) {
  const [selected, setSelected] = React.useState<number[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const toggleSelect = (id: number) => {
    if (isProcessing) return;
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (isProcessing) return;
    setSelected(selected.length === items.length ? [] : items.map(i => i.id));
  };

  // Lógica Unificada de Ação (Aprovar/Eliminar)
  const handleAction = async (type: "restore" | "delete") => {
    const isRestore = type === "restore";
    const count = selected.length;

    const result = await Swal.fire({
      title: isRestore ? 'Restaurar Itens?' : 'Eliminar Permanente?',
      text: isRestore 
        ? `Deseja retornar ${count} cadastros para a lista ativa?` 
        : `Atenção: ${count} itens serão apagados para sempre do banco de dados.`,
      icon: isRestore ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isRestore ? '#2563eb' : '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: isRestore ? 'Sim, Restaurar' : 'Sim, Apagar Tudo',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-[2.5rem] p-8',
        confirmButton: 'rounded-xl font-black uppercase text-xs tracking-widest px-8 py-4',
        cancelButton: 'rounded-xl font-bold px-8 py-4'
      }
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      
      // Mostra loading no centro enquanto processa
      Swal.fire({
        title: 'Sincronizando...',
        didOpen: () => { Swal.showLoading(); },
        allowOutsideClick: false,
        customClass: { popup: 'rounded-[2.5rem]' }
      });

      try {
        const res = isRestore 
          ? await restoreServicesBatchAction(selected) 
          : await deleteServicesBatchAction(selected);
        
        if (res.success) {
          // Sincronização automática com o servidor
          await onRefresh();
          
          Toast.fire({
            icon: 'success',
            title: isRestore ? 'Restaurados com sucesso!' : 'Eliminados do sistema!'
          });
          
          setSelected([]);
        } else {
          throw new Error();
        }
      } catch (error) {
        Toast.fire({
          icon: 'error',
          title: 'Erro na sincronização',
          text: 'Tente novamente em instantes.'
        });
      } finally {
        setIsProcessing(false);
        Swal.close();
      }
    }
  };

  return (
    <div className={`relative transition-all duration-500 ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}>
      
      {/* BARRA DE AÇÕES FLUTUANTE (DOCK) */}
      {selected.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 bg-slate-900 border border-slate-800 px-8 py-5 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="flex items-center gap-4 pr-8 border-r border-slate-700">
            <div className="h-12 w-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black text-lg rotate-3 shadow-lg shadow-blue-500/20">
              {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : selected.length}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Gerenciamento</p>
              <p className="text-sm font-bold text-white leading-none">Selecionados</p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => handleAction("restore")} 
              disabled={isProcessing}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl flex gap-3 h-12 px-8 text-xs uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-blue-500/20"
            >
              {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
              Restaurar
            </Button>
            <Button 
              onClick={() => handleAction("delete")} 
              disabled={isProcessing}
              className="bg-transparent text-red-400 hover:bg-red-500/10 hover:text-red-300 font-black rounded-2xl flex gap-3 h-12 px-6 text-xs uppercase tracking-widest transition-all"
            >
              <Trash2 className="h-4 w-4" /> Eliminar
            </Button>
          </div>
        </div>
      )}

      {/* TABELA PADRONIZADA */}
      <div className="bg-white rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              <th className="p-8 w-14">
                <Checkbox 
                  checked={selected.length === items.length && items.length > 0} 
                  onCheckedChange={toggleAll}
                  disabled={isProcessing}
                  className="rounded-md border-slate-300 data-[state=checked]:bg-blue-600"
                />
              </th>
              <th className="p-8">Negócio / Serviço</th>
              <th className="p-8 text-center">Data de Exclusão</th>
              <th className="p-8 text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className={`group transition-all duration-300 ${selected.includes(item.id) ? 'bg-blue-50/30' : 'hover:bg-slate-50/30'}`}>
                <td className="p-8">
                  <Checkbox 
                    checked={selected.includes(item.id)} 
                    onCheckedChange={() => toggleSelect(item.id)}
                    disabled={isProcessing}
                    className="rounded-md border-slate-300 data-[state=checked]:bg-blue-600"
                  />
                </td>
                <td className="p-8">
                  <div className="flex items-center gap-5">
                    <div className="h-14 w-14 relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 flex-shrink-0 shadow-inner">
                      {item.image ? (
                        <Image src={item.image} alt="" fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl grayscale opacity-30">🏢</div>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-base tracking-tight leading-none mb-1">{item.name}</p>
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded inline-block">
                        {item.category}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="p-8 text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-50 rounded-full text-[11px] font-black text-red-500 uppercase tracking-tighter">
                    <AlertCircle className="h-3 w-3" />
                    {new Date(item.deletedAt).toLocaleDateString('pt-BR')}
                  </div>
                </td>
                <td className="p-8">
                  <div className="flex justify-end gap-3">
                    <Button 
                      disabled={isProcessing}
                      onClick={() => { setSelected([item.id]); handleAction("restore"); }} 
                      variant="outline" 
                      className="h-10 w-10 p-0 rounded-xl border-slate-200 text-blue-600 hover:bg-blue-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button 
                      disabled={isProcessing}
                      onClick={() => { setSelected([item.id]); handleAction("delete"); }} 
                      variant="outline" 
                      className="h-10 w-10 p-0 rounded-xl border-slate-200 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div className="py-32 text-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl grayscale opacity-30">♻️</span>
            </div>
            <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-xs">A lixeira está vazia</p>
          </div>
        )}
      </div>
    </div>
  );
}