"use client";
import * as React from "react";
import { Button } from "./ui/button";
import { MessageCircle, Loader2 } from "lucide-react";

interface WhatsAppButtonProps {
  phone: string;
  providerEmail: string;
}

export default function WhatsAppButton({ phone, providerEmail }: WhatsAppButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleWhatsAppClick = async () => {
    setLoading(true);
    try {
      // 1. Notificação de interesse
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerEmail }),
      });

      // 2. Redirecionamento
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    } catch (error) {
      console.error("Erro na notificação:", error);
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  return (
    <Button 
      onClick={handleWhatsAppClick} 
      disabled={loading}
      // Revertido para bg-green-600 e text-lg font-bold conforme o original
      className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold rounded-xl flex gap-2 transition-all active:scale-[0.98]"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <MessageCircle className="h-5 w-5 fill-white/10" />
      )}
      {loading ? "Conectando..." : "Chamar no WhatsApp"}
    </Button>
  );
}