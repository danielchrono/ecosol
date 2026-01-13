"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ServiceCard from "@/components/service-card";
import { restoreServicesBatchAction, deleteServicesBatchAction } from "@/app/provider/actions";
import { Trash2, RotateCcw, AlertCircle, Loader2, Check, Inbox } from "lucide-react";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
});

interface TrashListProps {
  items: any[];
  onRefresh: () => Promise<void>;
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

  const handleAction = async (type: "restore" | "delete") => {
    const isRestore = type === "restore";
    const count = selected.length;

    const result = await Swal.fire({
      title: isRestore ? 'Restaurar Cadastros?' : 'Eliminar Permanente?',
      text: isRestore 
        ? `Deseja retornar ${count} itens para a lista ativa?` 
        : `Atenção: Ação irreversível para ${count} itens no banco de dados.`,
      icon: isRestore ? 'question' : 'warning',
      showCancelButton: true,
      confirmButtonColor: isRestore ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
      cancelButtonColor: 'hsl(var(--muted))',
      confirmButtonText: isRestore ? 'Sim, Restaurar' : 'Sim, Apagar Tudo',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-[2.5rem] p-8 bg-card text-foreground border border-border',
        confirmButton: 'rounded-xl font-black uppercase text-[10px] tracking-widest px-8 py-4',
        cancelButton: 'rounded-xl font-bold px-8 py-4'
      }
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      Swal.fire({
        title: 'Sincronizando...',
        didOpen: () => { Swal.showLoading(); },
        allowOutsideClick: false,
        customClass: { popup: 'rounded-[2.5rem] bg-card text-foreground' }
      });

      try {
        const res = isRestore 
          ? await restoreServicesBatchAction(selected) 
          : await deleteServicesBatchAction(selected);
        
        if (res.success) {
          await onRefresh();
          setSelected([]);
          Toast.fire({
            icon: 'success',
            title: isRestore ? 'Restaurados!' : 'Eliminados!',
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))'
          });
        } else { throw new Error(); }
      } catch (error) {
        Toast.fire({ icon: 'error', title: 'Erro na operação' });
      } finally {
        setIsProcessing(false);
        Swal.close();
      }
    }
  };

  return (
    <div className={`space-y-8 transition-all duration-500 ${isProcessing ? 'opacity-60 pointer-events-none' : ''}`}>
      
      {/* BARRA DE SELEÇÃO SUPERIOR */}
      {items.length > 0 && (
        <div className="flex items-center justify-between px-8 py-5 bg-card border border-border rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <Checkbox 
              checked={selected.length === items.length && items.length > 0} 
              onCheckedChange={toggleAll}
              disabled={isProcessing}
              className="h-6 w-6 rounded-lg border-2"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">Status da Lixeira</span>
              <span className="text-sm font-bold text-foreground">
                {selected.length} de {items.length} marcados
              </span>
            </div>
          </div>
          {selected.length > 0 && (
            <Button variant="ghost" onClick={() => setSelected([])} className="text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/10 transition-all">
              Limpar Seleção
            </Button>
          )}
        </div>
      )}

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} onClick={() => toggleSelect(item.id)} className="group relative">
            <Card className={`relative transition-all duration-500 rounded-[2.5rem] p-6 border-2 cursor-pointer h-full flex flex-col ${
                selected.includes(item.id) 
                  ? 'border-primary bg-primary/5 shadow-2xl scale-[0.98]' 
                  : 'border-transparent bg-card shadow-sm hover:border-border hover:shadow-xl'
              }`}>
              
              <div className="space-y-4 flex-1 flex flex-col">
                {/* Header Auditoria: Data de Exclusão */}
                <div className="flex justify-between items-center">
                  <div className="px-3 py-1 bg-destructive/10 rounded-full flex items-center gap-2 text-[8px] font-black text-destructive uppercase tracking-widest">
                    <AlertCircle size={10} /> Excluído em: {new Date(item.deletedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {/* Motor de Visualização Padronizado */}
                <ServiceCard service={item} />

                {/* Ações Rápidas de Rodapé */}
                <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                  <Button 
                    disabled={isProcessing}
                    onClick={(e) => { e.stopPropagation(); setSelected([item.id]); handleAction("restore"); }}
                    variant="ghost"
                    className="flex-1 h-10 text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 hover:text-primary font-black gap-2 rounded-2xl"
                  >
                    <RotateCcw className="h-4 w-4" /> Restaurar
                  </Button>
                  <Button 
                    disabled={isProcessing}
                    onClick={(e) => { e.stopPropagation(); setSelected([item.id]); handleAction("delete"); }}
                    variant="ghost"
                    className="h-10 px-4 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Indicador de Seleção Visual */}
              {selected.includes(item.id) && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg ring-4 ring-background animate-in zoom-in">
                  <Check className="h-4 w-4 stroke-[4px]" />
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* EMPTY STATE PADRONIZADO */}
      {items.length === 0 && (
        <div className="py-32 text-center bg-card rounded-[3rem] border-2 border-dashed border-border transition-all">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
            <Inbox size={40} />
          </div>
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Tudo Limpo</h3>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-2">Sua logística de dados está em dia</p>
        </div>
      )}

      {/* DOCK DE AÇÕES EM LOTE */}
      {selected.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 bg-background border-2 border-primary px-8 py-5 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="flex items-center gap-4 pr-8 border-r border-border">
            <div className="h-12 w-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black text-lg rotate-2 shadow-lg shadow-primary/20">
              {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : selected.length}
            </div>
            <div>
              <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] leading-none mb-1">Lote Limbo</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                {isProcessing ? "Limpando" : "Selecionados"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              disabled={isProcessing}
              onClick={() => handleAction("restore")} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex gap-3 h-12 px-8 text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <RotateCcw className="h-4 w-4" /> Restaurar
            </Button>
            <Button 
              disabled={isProcessing}
              onClick={() => handleAction("delete")} 
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive font-black rounded-2xl flex gap-3 h-12 px-6 text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              <Trash2 className="h-4 w-4" /> Apagar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}