"use client";
import { Service } from "@prisma/client";
import { Button } from "./ui/button";
import Link from "next/link";
import ContactIcons from "./contact-icons";
import { Card } from "./ui/card";
import { ArrowUpRight } from "lucide-react";

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <Card className="flex flex-col h-full border-border hover:border-primary/40 transition-all duration-300 p-3.5 shadow-sm group">
      
      {/* Imagem */}
      <div className="relative aspect-video rounded-[1.6rem] bg-muted overflow-hidden border border-border mb-2.5">
        <img
          src={service.image || "/placeholder.png"}
          alt={service.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Título e descrição */}
      <div className="flex-1 px-0.5">
        <h3 className="text-base font-black text-foreground leading-tight uppercase tracking-tight">
          {service.name}
        </h3>
        {service.description && (
          <p className="text-muted-foreground text-[10px] line-clamp-2 leading-tight font-medium mt-0.5 opacity-90">
            {service.description}
          </p>
        )}
      </div>

      {/* Rodapé estruturado */}
      <div className="mt-3 pt-3 border-t border-border space-y-3">
        
        {/* Linha Superior: Categoria + Perfil */}
        <div className="flex items-center justify-between">
          <span className="text-[7px] font-black text-primary uppercase tracking-[0.2em] px-2 py-1 bg-primary/10 rounded-md">
            {service.category}
          </span>

          <Link href={`/provider/${service.id}`}>
            <Button variant="ghost" className="h-6 px-2 rounded-lg text-primary font-black text-[9px] uppercase tracking-widest hover:bg-primary/10 transition-colors">
              Perfil <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>

        {/* Linha Inferior: Ícones de Contato (agora com espaço total) */}
        <div className="flex items-center">
          <ContactIcons
            contacts={{
              whatsapp: service.whatsapp ?? undefined,
              instagram: service.instagram ?? undefined,
              tiktok: service.tiktok ?? undefined,
              email: service.email ?? undefined,
              site: service.site ?? undefined,
            }}
          />
        </div>
      </div>
    </Card>
  );
}