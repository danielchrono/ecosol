"use client";

import { Button } from "./ui/button";

interface WhatsAppButtonProps {
  phone: string;
  providerEmail: string;
}

export default function WhatsAppButton({ phone, providerEmail }: WhatsAppButtonProps) {
  const handleWhatsAppClick = async () => {
    try {
      // 1. Dispara a notificação de interesse para o banco
      await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerEmail }),
      });

      // 2. Limpa o número e abre o link
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    } catch (error) {
      console.error("Erro na notificação:", error);
      // Mesmo com erro na API, abrimos o WhatsApp para não perder a venda
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    }
  };

  return (
    <Button 
      onClick={handleWhatsAppClick} 
      className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg font-bold"
    >
      Chamar no WhatsApp
    </Button>
  );
}