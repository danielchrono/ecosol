"use client";
import * as React from "react";
import { Button } from "./ui/button";

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

  // Lógica de Seleção
  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    setSelectedIds(selectedIds.length === notifications.length ? [] : notifications.map(n => n.id));
  };

  // Ações de API
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
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 mt-16 overflow-hidden animate-in slide-in-from-right-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="p-5 border-b bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Notificações</h3>
            <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Central de Alertas</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">✕</button>
        </div>

        {/* Barra de Ferramentas de Seleção */}
        {notifications.length > 0 && (
          <div className="px-5 py-3 border-b bg-white flex justify-between items-center bg-blue-50/30">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={selectedIds.length === notifications.length && notifications.length > 0}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs font-semibold text-slate-600">
                {selectedIds.length > 0 ? `${selectedIds.length} selecionadas` : "Selecionar todas"}
              </span>
            </div>
            
            <div className="flex gap-3">
              {selectedIds.length > 0 ? (
                <>
                  <button onClick={() => handleAction("PATCH", selectedIds)} className="text-[11px] font-bold text-blue-600 hover:underline">Lidas</button>
                  <button onClick={() => handleAction("DELETE", selectedIds)} className="text-[11px] font-bold text-red-500 hover:underline">Excluir</button>
                </>
              ) : (
                <button onClick={() => handleAction("PATCH", [], true)} className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition-colors">Marcar tudo como lido</button>
              )}
            </div>
          </div>
        )}

        {/* Lista */}
        <div className="max-h-[450px] overflow-y-auto p-3 space-y-2 bg-slate-50/30">
          {notifications.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm italic">Sua caixa de entrada está limpa!</div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`group relative flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                  n.read ? 'bg-white/50 border-slate-100 opacity-70' : 'bg-white border-blue-100 shadow-sm'
                } ${selectedIds.includes(n.id) ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
              >
                {/* Checkbox de Seleção Individual */}
                <input 
                  type="checkbox"
                  checked={selectedIds.includes(n.id)}
                  onChange={() => toggleSelect(n.id)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />

                <div className="flex-1 cursor-pointer" onClick={() => !n.read && handleAction("PATCH", [n.id])}>
                  <p className={`text-sm leading-snug ${n.read ? 'text-slate-500' : 'text-slate-900 font-semibold'}`}>
                    {n.message}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                    {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                {/* Botão de Excluir Individual */}
                <button 
                  onClick={() => handleAction("DELETE", [n.id])}
                  className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  🗑️
                </button>

                {!n.read && <span className="absolute right-4 top-4 w-2 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>}
              </div>
            ))
          )}
        </div>
        
        <div className="p-4 border-t bg-white">
          <Button variant="outline" className="w-full text-xs font-bold text-slate-400 border-slate-100" onClick={onClose} disabled={loading}>
            {loading ? "Processando..." : "Fechar Painel"}
          </Button>
        </div>
      </div>
    </div>
  );
}