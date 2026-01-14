"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ServiceCard from "@/components/service-card";
import Dock from "@/components/ui/dock";
import { approveServicesBatchAction, removeServicesBatchAction } from "@/app/provider/actions";
import { CheckCircle2, Trash2, Check, Loader2, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

// Importação CORRETA da Central de Estilo e Notificações
import { confirmAction, showLoading, notify } from "@/lib/swal"; // <-- NOTIFY AGORA VEM DO SWAL.TS

interface DashboardListProps {
  initialItems: any[];
  onRefresh: () => Promise<void> | void;
  isAdmin?: boolean; 
}

export default function DashboardList({ initialItems, onRefresh, isAdmin = false }: DashboardListProps) {
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const toggleSelect = (id: number) => {
    if (isProcessing || !isAdmin) return;
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (isProcessing || !isAdmin) return;
    setSelectedIds(selectedIds.length === initialItems.length ? [] : initialItems.map(p => p.id));
  };

  const handleBatchAction = async (type: "approve" | "remove", targetIds?: number[]) => {
    if (!isAdmin) return;
    const idsToProcess = targetIds || selectedIds;
    const isApprove = type === "approve";
    const count = idsToProcess.length;

    if (count === 0) return;
    
    // 1. Confirmação usando a nova função
    const result = await confirmAction({
      title: isApprove ? 'Aprovar Cadastros?' : 'Recusar Itens?',
      text: `Deseja processar ${count} ${count > 1 ? 'solicitações' : 'solicitação'} agora?`,
      icon: 'question',
      theme: isApprove ? 'primary' : 'destructive',
      confirmText: isApprove ? 'Sim, Aprovar' : 'Sim, Recusar',
      cancelText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      
      // 2. Modal de Sincronização usando a nova função
      showLoading('Sincronizando...');

      try {
        const res = isApprove 
          ? await approveServicesBatchAction(idsToProcess) 
          : await removeServicesBatchAction(idsToProcess);
        
        // 3. GESTOR AUTOMÁTICO: Fecha o Swal e abre o Toast
        notify.auto(res.success, isApprove ? 'Aprovado com sucesso!' : 'Removido com sucesso!');
        
        if (res.success) {
          await onRefresh(); 
          setSelectedIds([]);
        }
      } catch (error) {
        notify.error("Erro na operação de lote");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className={cn("space-y-8 transition-all duration-500 pb-32", isProcessing && "opacity-60 pointer-events-none")}>
      
      {isAdmin && initialItems.length > 0 && (
        <div className="flex items-center justify-between px-8 py-5 bg-card border border-border rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
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
              className={cn(
                "relative transition-all duration-500 rounded-2xl p-6 border-2 h-full flex flex-col",
                isAdmin && "cursor-pointer",
                selectedIds.includes(p.id) 
                  ? 'border-primary bg-primary/5 shadow-2xl scale-[0.98]' 
                  : 'border-transparent bg-card shadow-sm hover:border-border hover:shadow-xl'
              )}
            >
              <div className="space-y-4 flex-1 flex flex-col">
                <ServiceCard service={p} />
                
                {isAdmin && (
                  <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                    <Button 
                      disabled={isProcessing}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleBatchAction("approve", [p.id]); 
                      }}
                      variant="ghost"
                      className="flex-1 h-10 text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 font-black gap-2 rounded-xl transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4" /> Aprovar
                    </Button>
                    
                    <Button 
                      disabled={isProcessing}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleBatchAction("remove", [p.id]); 
                      }}
                      variant="ghost"
                      className="h-10 px-4 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
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

      {initialItems.length === 0 && (
        <div className="py-32 text-center bg-card rounded-2xl border-2 border-dashed border-border">
          <Inbox className="w-16 h-16 text-muted-foreground/20 mx-auto mb-4" />
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-none">Tudo em ordem</h3>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-2">Nenhum cadastro pendente</p>
        </div>
      )}

      {/* DOCK DE AÇÕES */}
      {isAdmin && selectedIds.length > 0 && (
        <Dock>
          <div className="flex items-center gap-3 md:gap-4 pr-3 md:pr-8 border-r border-border flex-shrink-0">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black text-sm md:text-lg shadow-lg shadow-primary/20">
              {isProcessing ? <Loader2 className="h-5 w-5 animate-spin" /> : selectedIds.length}
            </div>
            <div className="hidden xs:block">
              <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] leading-none mb-1">Lote</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                {isProcessing ? "Sinc..." : "Selecionados"}
              </p>
            </div>
          </div>
          
          <div className="flex flex-nowrap gap-2 md:gap-4 flex-1 md:flex-none ml-2 md:ml-4">
            <Button 
              disabled={isProcessing}
              onClick={() => handleBatchAction("approve")} 
              className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl flex items-center justify-center gap-2 h-10 md:h-12 px-3 md:px-8 text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
            >
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" /> 
              <span>Aprovar Todos</span>
            </Button>
            <Button 
              disabled={isProcessing}
              onClick={() => handleBatchAction("remove")} 
              variant="ghost"
              className="flex-1 md:flex-none text-destructive hover:bg-destructive/10 hover:text-destructive font-black rounded-xl flex items-center justify-center gap-2 h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-xs uppercase tracking-[0.2em] transition-all active:scale-95 whitespace-nowrap"
            >
              <Trash2 className="h-4 w-4 flex-shrink-0" /> 
              <span>Recusar</span>
            </Button>
          </div>
        </Dock>
      )}
    </div>
  );
}