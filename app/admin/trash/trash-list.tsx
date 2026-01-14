"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import ServiceCard from "@/components/service-card";
import Dock from "@/components/ui/dock";
import { restoreServicesBatchAction, deleteServicesBatchAction } from "@/app/provider/actions";
import { Trash2, RotateCcw, AlertCircle, Loader2, Check, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

// Importação CORRETA da Logística de Estilo e Notificações
import { confirmAction, showLoading, notify } from "@/lib/swal"; // <-- NOTIFY AGORA VEM DO SWAL.TS

interface TrashListProps {
  items: any[];
  onRefresh: () => Promise<void>;
  isAdmin?: boolean; 
}

export default function TrashList({ items, onRefresh, isAdmin = false }: TrashListProps) {
  const [selected, setSelected] = React.useState<number[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const toggleSelect = (id: number) => {
    if (isProcessing || !isAdmin) return;
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (isProcessing || !isAdmin) return;
    setSelected(selected.length === items.length ? [] : items.map(i => i.id));
  };

  const handleAction = async (type: "restore" | "delete", targetIds?: number[]) => {
    if (!isAdmin) return;
    const idsToProcess = targetIds || selected;
    const isRestore = type === "restore";
    const count = idsToProcess.length;

    if (count === 0) return;

    // 1. Confirmação usando a nova função
    const result = await confirmAction({
      title: isRestore ? 'Restaurar Cadastros?' : 'Eliminar Permanente?',
      text: isRestore 
        ? `Deseja retornar ${count} ${count > 1 ? 'itens' : 'item'} para a lista ativa?` 
        : `Atenção: Ação irreversível para ${count} ${count > 1 ? 'itens' : 'item'} no banco de dados.`,
      icon: isRestore ? 'question' : 'warning',
      theme: isRestore ? 'primary' : 'destructive',
      confirmText: isRestore ? 'Sim, Restaurar' : 'Sim, Apagar Tudo',
      cancelText: 'Cancelar'
    });

    if (result.isConfirmed) {
      setIsProcessing(true);
      
      // 2. Modal de Sincronização usando a nova função
      showLoading('Sincronizando...');

      try {
        const res = isRestore 
          ? await restoreServicesBatchAction(idsToProcess) 
          : await deleteServicesBatchAction(idsToProcess);
        
        // 3. GESTOR AUTOMÁTICO: Fecha o Swal e abre o Toast
        notify.auto(
          res.success, 
          isRestore ? 'Restaurado com sucesso!' : 'Eliminado permanentemente!',
          'Falha na sincronização dos dados.'
        );
        
        if (res.success) {
          await onRefresh();
          setSelected([]);
        }
      } catch (error) {
        notify.error("Erro crítico ao processar lixeira.");
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className={cn("space-y-8 transition-all duration-500 pb-32", isProcessing && "opacity-60 pointer-events-none")}>
      
      {/* BARRA DE SELEÇÃO SUPERIOR */}
      {isAdmin && items.length > 0 && (
        <div className="flex items-center justify-between px-8 py-5 bg-card border border-border rounded-2xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
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
            <Card className={cn(
              "relative transition-all duration-500 rounded-2xl p-6 border-2 h-full flex flex-col",
              isAdmin && "cursor-pointer",
              selected.includes(item.id) 
                ? 'border-primary bg-primary/5 shadow-2xl scale-[0.98]' 
                : 'border-transparent bg-card shadow-sm hover:border-border hover:shadow-xl'
            )}>
              
              <div className="space-y-4 flex-1 flex flex-col">
                <div className="flex justify-between items-center">
                  <div className="px-3 py-1 bg-destructive/10 rounded-full flex items-center gap-2 text-[8px] font-black text-destructive uppercase tracking-widest">
                    <AlertCircle size={10} /> Excluído em: {new Date(item.deletedAt).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <ServiceCard service={item} />

                {isAdmin && (
                  <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                    <Button 
                      disabled={isProcessing}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleAction("restore", [item.id]); 
                      }}
                      variant="ghost"
                      className="flex-1 h-10 text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10 hover:text-primary font-black gap-2 rounded-2xl transition-all"
                    >
                      <RotateCcw className="h-4 w-4" /> Restaurar
                    </Button>
                    <Button 
                      disabled={isProcessing}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleAction("delete", [item.id]); 
                      }}
                      variant="ghost"
                      className="h-10 px-4 rounded-2xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

              {selected.includes(item.id) && (
                <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1.5 shadow-lg ring-4 ring-background animate-in zoom-in">
                  <Check className="h-4 w-4 stroke-[4px]" />
                </div>
              )}
            </Card>
          </div>
        ))}
      </div>

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <div className="py-32 text-center bg-card rounded-2xl border-2 border-dashed border-border transition-all">
          <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 opacity-30">
            <Inbox size={40} />
          </div>
          <h3 className="text-xl font-black text-foreground uppercase tracking-tight leading-none">Tudo Limpo</h3>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-2">Sua logística de dados está em dia</p>
        </div>
      )}

      {/* DOCK DE AÇÕES EM LOTE */}
      {isAdmin && selected.length > 0 && (
        <Dock>
          <div className="flex items-center gap-4 pr-4 md:pr-8 border-r border-border flex-shrink-0">
            <div className="h-10 w-10 md:h-12 md:w-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center font-black text-sm md:text-lg shadow-lg shadow-primary/20">
              {isProcessing ? <Loader2 className="h-6 w-6 animate-spin" /> : selected.length}
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-foreground uppercase tracking-[0.2em] leading-none mb-1">Lote Limbo</p>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">
                {isProcessing ? "Limpando" : "Selecionados"}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 md:gap-4 ml-2 md:ml-4 flex-1 md:flex-none">
            <Button 
              disabled={isProcessing}
              onClick={() => handleAction("restore")} 
              className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-primary-foreground font-black rounded-xl flex gap-3 h-10 md:h-12 px-3 md:px-8 text-[10px] md:text-xs uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all whitespace-nowrap"
            >
              <RotateCcw className="h-4 w-4" /> Restaurar
            </Button>
            <Button 
              disabled={isProcessing}
              onClick={() => handleAction("delete")} 
              variant="ghost"
              className="flex-1 md:flex-none text-destructive hover:bg-destructive/10 hover:text-destructive font-black rounded-xl flex gap-3 h-10 md:h-12 px-2 md:px-6 text-[10px] md:text-xs uppercase tracking-[0.2em] active:scale-95 transition-all whitespace-nowrap"
            >
              <Trash2 className="h-4 w-4" /> Apagar
            </Button>
          </div>
        </Dock>
      )}
    </div>
  );
}