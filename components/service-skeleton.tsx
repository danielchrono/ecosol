"use client";

import { Card } from "./ui/card";

export default function ServiceSkeleton() {
  return (
    /* Mantido exatamente o mesmo wrapper do ServiceCard */
    <Card className="flex flex-col h-full border-border p-3.5 shadow-sm animate-pulse rounded-[2.5rem]">
      
      {/* 1. Imagem: aspect-video + rounded-[1.6rem] */}
      <div className="aspect-video rounded-[1.6rem] bg-muted mb-2.5" />

      {/* 2. Título e Descrição */}
      <div className="flex-1 px-0.5">
        {/* Simula o h3 (text-base) */}
        <div className="h-4 w-3/4 bg-muted rounded-md mb-2" />
        
        {/* Simula a descrição (text-[10px] - 2 linhas) */}
        <div className="space-y-1.5">
          <div className="h-2 w-full bg-muted/60 rounded" />
          <div className="h-2 w-[90%] bg-muted/60 rounded" />
        </div>
      </div>

      {/* 3. Rodapé Estruturado (mt-3 pt-3 border-t) */}
      <div className="mt-3 pt-3 border-t border-border space-y-3">
        
        {/* Linha Superior: Categoria + Perfil */}
        <div className="flex items-center justify-between">
          {/* Badge da Categoria (bg-primary/10) */}
          <div className="h-4 w-14 bg-primary/10 rounded-md" />

          {/* Botão Perfil (h-6) */}
          <div className="h-6 w-16 bg-muted rounded-lg" />
        </div>

        {/* Linha Inferior: Ícones de Contato */}
        <div className="flex items-center gap-2">
          {/* Simula 4 ícones de contato (círculos/rounded-full) */}
          <div className="h-6 w-6 bg-muted rounded-full" />
          <div className="h-6 w-6 bg-muted rounded-full" />
          <div className="h-6 w-6 bg-muted rounded-full" />
          <div className="h-6 w-6 bg-muted rounded-full" />
        </div>
      </div>
    </Card>
  );
}