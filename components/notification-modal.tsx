"use client";

import * as React from "react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { X, Trash2, BellRing, CheckCheck } from "lucide-react";

interface Notification {
  id: number;
  message: string;
  createdAt: string;
  read: boolean;
}

export default function NotificationModal({ 
  isOpen, onClose, notifications, userEmail, onRefresh 
}: { 
  isOpen: boolean; onClose: () => void; notifications: Notification[]; userEmail: string; onRefresh: () => void;
}) {
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState(false);

  if (!isOpen) return null;

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === notifications.length ? [] : notifications.map(n => n.id));
  };

  const handleAction = async (method: "PATCH" | "DELETE", ids?: number[], all = false) => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/notifications", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, ids, all }),
      });

      if (res.ok) {
        setSelectedIds([]);
        onRefresh();
      }
    } catch (err) {
      console.error("Erro na ação de notificação:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/40 backdrop-blur-sm transition-all" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-card rounded-[2.5rem] shadow-2xl border border-border mt-16 overflow-hidden animate-in slide-in-from-right-5 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho - bg-slate-50 -> bg-muted/50 */}
        <div className="p-6 border-b border-border bg-muted/30 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <BellRing size={20} />
            </div>
            <div>
              <h3 className="font-black text-foreground text-lg tracking-tighter uppercase leading-none">Notificações</h3>
              <p className="text-[9px] text-primary font-black uppercase tracking-[0.2em] mt-1">Ecosol Hub</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        {/* Barra de Ferramentas - bg-blue-50/30 -> bg-primary/5 */}
        {notifications.length > 0 && (
          <div className="px-6 py-3 border-b border-border bg-primary/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={selectedIds.length === notifications.length && notifications.length > 0}
                onCheckedChange={toggleSelectAll}
                className="border-border"
              />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                {selectedIds.length > 0 ? `${selectedIds.length} selecionadas` : "Marcar todas"}
              </span>
            </div>
            
            <div className="flex gap-4">
              {selectedIds.length > 0 ? (
                <>
                  <button onClick={() => handleAction("PATCH", selectedIds)} className="text-[10px] font-black uppercase text-primary hover:opacity-70 transition-all flex items-center gap-1">
                    <CheckCheck size={14} /> Lidas
                  </button>
                  <button onClick={() => handleAction("DELETE", selectedIds)} className="text-[10px] font-black uppercase text-destructive hover:opacity-70 transition-all flex items-center gap-1">
                    <Trash2 size={14} /> Excluir
                  </button>
                </>
              ) : (
                <button onClick={() => handleAction("PATCH", [], true)} className="text-[10px] font-black uppercase text-muted-foreground hover:text-primary transition-colors">
                  Lêr tudo
                </button>
              )}
            </div>
          </div>
        )}

        {/* Lista de Notificações - bg-slate-50/30 -> bg-background */}
        <div className="max-h-112.5 overflow-y-auto p-4 space-y-3 bg-background/50 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="py-24 text-center">
               <div className="text-4xl grayscale opacity-20 mb-4">✉️</div>
               <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest italic">Caixa de entrada limpa</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`group relative flex items-start gap-4 p-5 rounded-3xl border transition-all duration-300 ${
                  n.read 
                    ? 'bg-muted/20 border-border opacity-60' 
                    : 'bg-card border-primary/20 shadow-sm'
                } ${selectedIds.includes(n.id) ? 'ring-2 ring-primary border-transparent bg-primary/5' : ''}`}
              >
                <div className="mt-1">
                  <Checkbox 
                    checked={selectedIds.includes(n.id)}
                    onCheckedChange={() => toggleSelect(n.id)}
                    className="border-border"
                  />
                </div>

                <div className="flex-1 cursor-pointer" onClick={() => !n.read && handleAction("PATCH", [n.id])}>
                  <p className={`text-sm leading-relaxed ${n.read ? 'text-muted-foreground font-medium' : 'text-foreground font-bold'}`}>
                    {n.message}
                  </p>
                  <span className="text-[9px] text-muted-foreground mt-3 block font-black uppercase tracking-widest">
                    {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <button 
                  onClick={() => handleAction("DELETE", [n.id])}
                  className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>

                {!n.read && (
                  <span className="absolute right-4 top-4 w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-pulse"></span>
                )}
              </div>
            ))
          )}
        </div>
        
        {/* Rodapé - bg-white -> bg-card */}
        <div className="p-6 border-t border-border bg-card">
          <Button 
            variant="outline" 
            className="w-full text-[10px] font-black uppercase tracking-[0.2em] h-14 rounded-2xl hover:bg-muted transition-all active:scale-[0.98]" 
            onClick={onClose} 
            disabled={loading}
          >
            {loading ? "Sincronizando..." : "Fechar Central"}
          </Button>
        </div>
      </div>
    </div>
  );
}