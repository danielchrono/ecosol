"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ServiceCard from "@/components/service-card";
import { approveServicesBatchAction, removeServicesBatchAction } from "@/app/provider/actions";
import { CheckCircle2, Trash2, Check, Loader2, Inbox } from "lucide-react";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
});

export default function DashboardList({ initialItems, onRefresh }: { initialItems: any[], onRefresh: () => Promise<void> | void }) {
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const toggleSelect = (id: number) => {
    if (isProcessing) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (isProcessing) return;
    setSelectedIds(selectedIds.length === initialItems.length ? [] : initialItems.map(p => p.id));
  };

  // 🛠️ LOGÍSTICA CORRIGIDA: targetIds permite execução imediata ignorando o delay do estado
  const handleBatchAction = async (type: "approve" | "remove", targetIds?: number[]) => {
    const idsToProcess = targetIds || selectedIds;
    const isApprove = type === "approve";
    const count = idsToProcess.length;

    if (count === 0) return;
    
    const result = await Swal.fire({
      title: isApprove ? 'Aprovar Cadastros?' : 'Recusar Itens?',
      text: `Deseja processar ${count} ${count > 1 ? 'solicitações' : 'solicitação'} agora?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: isApprove ? 'hsl(var(--primary))' : 'hsl(var(--destructive))',
      cancelButtonColor: 'hsl(var(--muted))',
      confirmButtonText: isApprove ? 'Sim, Aprovar' : 'Sim, Recusar',
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
        customClass: { popup: 'rounded-[2.5rem] bg-card text-foreground border border-border' }
      });

      try {
        const res = isApprove 
          ? await approveServicesBatchAction(idsToProcess) 
          : await removeServicesBatchAction(idsToProcess);
        
        if (res.success) {
          await onRefresh(); 
          setSelectedIds([]); // Limpa seleção após sucesso
          Toast.fire({
            icon: 'success',
            title: isApprove ? 'Aprovado!' : 'Removido!',
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
    <div className={`space-y-8 transition-all duration-500 ${isProcessing ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>
      
      {/* BARRA DE SELEÇÃO SUPERIOR */}
      {initialItems.length > 0 && (
        <div className="flex items-center justify-between px-8 py-5 bg-card border border-border rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4">
            <Checkbox 
              checked={selectedIds.length === initialItems.length && initialItems.length > 0}
              onCheckedChange={toggleSelectAll}
              disabled={isProcessing}
              className="h-6 w-6 rounded-lg border-2"
            />
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground leading-none mb-1">Logística de Curadoria</span>
              <span className="text-sm font-bold text-foreground">
                {selectedIds.length} de {initialItems.length} selecionados
              </span>
            </div>
          </div>
          {selectedIds.length > 0 && !isProcessing && (
            <Button variant="ghost" onClick={() => setSelectedIds([])} className="text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary/10 transition-all">
              Desmarcar Tudo
            </Button>
          )}
        </div>
      )}

      {/* GRID DE CARDS */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {initialItems.map((p) => (
          <div key={p.id} onClick={() => toggleSelect(p.id)} className="group relative">
            <Card 
              className={`relative transition-all duration-500 rounded-[2.5rem] p-6 border-2 cursor-pointer h-full flex flex-col ${
                selectedIds.includes(p.id) 
                  ? 'border-primary bg-primary/5 shadow-2xl scale-[0.98]' 
                  : 'border-transparent bg-card shadow-sm hover:border-border hover:shadow-xl'
              }`}
            >
              <div className="space-y-4 flex-1 flex flex-col">
                <ServiceCard service={p} />
                
                <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                  <Button 
                    disabled={isProcessing}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleBatchAction("approve", [p.id]); // Injeta ID direto no array
                    }}
                    variant="ghost"
                    className="flex-1 h-10 text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 hover:text-primary font-black gap-2 rounded-2xl transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Aprovar
                  </Button>
                  
                  <Button 
                    disabled={isProcessing}
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleBatchAction("remove", [p.id]); // Injeta ID direto no array
                    }}
                    variant="ghost"
                    className="h-10 px-4 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {selectedIds.includes(p.id) && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg ring-4 ring-background animate-in zoom-in">
                  <Check className="h-4 w-4 stroke-[4px]" />
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {initialItems.length === 0 && (
        <div className="py-32 text-center bg-card rounded-[3rem] border-2 border-dashed border-border transition-colors">
          <Inbox className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-none">Tudo em ordem</h3>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-2">Nenhum cadastro pendente</p>
        </div>
      )}

      {/* DOCK DE AÇÕES EM LOTE */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center gap-8 bg-background border-2 border-primary px-8 py-5 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-10 duration-500">
          <div className="flex items-center gap-4 pr-8 border-r border-border">
            <div className="h-12 w-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black text-lg rotate-3 shadow-lg shadow-primary/20">
              {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : selectedIds.length}
            </div>
            <div>
              <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] leading-none mb-1">Lote</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                {isProcessing ? "Sincronizando" : "Selecionados"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              disabled={isProcessing}
              onClick={() => handleBatchAction("approve")} // Usa o estado global selectedIds
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-2xl flex gap-3 h-12 px-8 text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              <CheckCircle2 className="h-4 w-4" /> Aprovar
            </Button>
            <Button 
              disabled={isProcessing}
              onClick={() => handleBatchAction("remove")} // Usa o estado global selectedIds
              variant="ghost"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive font-black rounded-2xl flex gap-3 h-12 px-6 text-xs uppercase tracking-widest transition-all active:scale-95"
            >
              <Trash2 className="h-4 w-4" /> Recusar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}