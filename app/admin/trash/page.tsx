"use client";
import * as React from "react";
import Header from "@/components/header";
import TrashList from "./trash-list";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Trash2 } from "lucide-react";

export default function AdminTrashPage() {
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const router = useRouter();

  // Função de carga com logística anti-cache e sincronização de tema
  async function loadTrashed() {
    try {
      const res = await fetch("/api/admin/trash", { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      }); 
      
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        router.refresh(); 
      }
    } catch (err) {
      console.error("Erro ao carregar lixeira:", err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadTrashed();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-black text-muted-foreground animate-pulse uppercase tracking-[0.3em] text-[10px]">
          Escaneando Limbo...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
      <Header />
      <main className="mx-auto max-w-5xl p-6 py-12">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <Link href="/admin/dashboard" className="group flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Dashboard
            </Link>
            <h1 className="text-4xl font-black text-foreground tracking-tighter flex items-center gap-3 uppercase">
              Lixeira <span className="text-muted-foreground/30 font-light">|</span> <Trash2 className="text-muted-foreground w-8 h-8" />
            </h1>
            <p className="text-muted-foreground font-medium">Recupere cadastros ou elimine dados permanentemente.</p>
          </div>
          
          {/* Badge Adaptativo: Sai bg-slate-900 (invisível no dark) e entra bg-primary */}
          <div className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">
            {items.length} Itens no Limbo
          </div>
        </div>

        {/* O TrashList já foi corrigido anteriormente para usar bg-card e border-border */}
        <TrashList items={items} onRefresh={loadTrashed} />
      </main>
    </div>
  );
}