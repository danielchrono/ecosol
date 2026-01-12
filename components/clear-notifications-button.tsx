"use client";
import * as React from "react";
import { useRouter } from "next/navigation";

export default function ClearNotificationsButton({ email }: { email: string }) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleClear = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/user/notifications/read", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        // router.refresh() força o Next.js a revalidar os dados do Prisma 
        // no servidor e atualizar a UI sem recarregar a página.
        router.refresh(); 
      }
    } catch (err) {
      console.error("Erro ao limpar notificações:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleClear}
      disabled={loading}
      className="text-xs text-blue-600 hover:text-blue-800 font-bold underline disabled:opacity-50 transition-colors"
    >
      {loading ? "Processando..." : "Marcar todas como lidas"}
    </button>
  );
}