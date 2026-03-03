"use client";

import * as React from "react";

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`
      /* Estrutura Dinâmica (Dark Mode Ready) */
      bg-card border border-border rounded-4xl p-5 text-foreground
      
      /* Sombras de Engenharia adaptativas */
      shadow-sm hover:shadow-xl hover:shadow-primary/5 
      hover:border-primary/30 transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  );
}