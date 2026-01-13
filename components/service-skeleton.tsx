"use client";
import { Card } from "./ui/card";

export default function ServiceSkeleton() {
  return (
    /* - bg-white -> bg-card
       - border-slate-50 -> border-border
    */
    <Card className="rounded-[2.5rem] p-3.5 border border-border bg-card animate-pulse">
      
      {/* Área da Imagem: bg-muted para profundidade */}
      <div className="w-full aspect-video bg-muted rounded-[1.8rem] mb-2.5" />
      
      <div className="space-y-1.5 px-0.5">
        {/* Título */}
        <div className="h-4 w-3/4 bg-muted rounded-lg" />
        
        {/* Descrição: bg-muted/60 para ser mais discreto */}
        <div className="space-y-1">
          <div className="h-2 w-full bg-muted/60 rounded" />
          <div className="h-2 w-4/5 bg-muted/60 rounded" />
        </div>
      </div>

      {/* Divisor e Footer */}
      <div className="mt-2 pt-2 border-t border-border space-y-2">
        {/* Tag/Badge: bg-primary/10 para sugerir a cor do tema */}
        <div className="h-3 w-14 bg-primary/10 rounded-md" />
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {/* Ícones de ação */}
            <div className="h-7 w-7 bg-muted rounded-xl" />
            <div className="h-7 w-7 bg-muted rounded-xl" />
          </div>
          
          {/* Botão de Preço/Ação */}
          <div className="h-7 w-16 bg-muted rounded-xl" />
        </div>
      </div>
    </Card>
  );
}