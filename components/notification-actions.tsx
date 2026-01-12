"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

export default function NotificationActions({ 
  email, 
  unreadCount, 
  totalCount 
}: { 
  email: string, 
  unreadCount: number, 
  totalCount: number 
}) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleAction = async (method: "PATCH" | "DELETE", endpoint: string) => {
    setLoading(true);
    await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    router.refresh(); // Sincroniza o servidor
    setLoading(false);
  };

  if (totalCount === 0) return null;

  return (
    <div className="flex gap-4 items-center">
      {/* Botão Marcar como Lidas: Só aparece se houver não lidas */}
      {unreadCount > 0 && (
        <button 
          onClick={() => handleAction("PATCH", "/api/user/notifications/read")}
          disabled={loading}
          className="text-xs text-blue-600 font-bold hover:underline disabled:opacity-50"
        >
          {loading ? "..." : "Marcar como lidas"}
        </button>
      )}

      {/* Botão Limpar: Aparece sempre que houver QUALQUER mensagem */}
      <button 
        onClick={() => handleAction("DELETE", "/api/user/notifications")}
        disabled={loading}
        className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors disabled:opacity-50"
      >
        {loading ? "..." : "Limpar Histórico"}
      </button>
    </div>
  );
}