"use client";
import * as React from "react";
import Link from "next/link";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import DashboardList from "./dashboard-list";
import { Loader2, Trash2, LayoutDashboard } from "lucide-react";

export default function AdminDashboard() {
  const [pending, setPending] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    try {
      // Logística Anti-Cache para dados sempre frescos
      const res = await fetch("/api/admin/pending", { 
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setPending(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-black text-muted-foreground animate-pulse uppercase tracking-[0.3em] text-[10px]">
          Sincronizando Base...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground pb-32 transition-colors duration-300">
      <Header />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-10 gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <LayoutDashboard size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">Painel Admin</h2>
              <p className="text-muted-foreground font-medium">Controle de qualidade e curadoria Ecosol.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/admin/trash" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full rounded-2xl border-border bg-card font-bold h-12 px-6 shadow-sm hover:bg-muted gap-2">
                <Trash2 size={18} /> Lixeira
              </Button>
            </Link>
            <div className="bg-primary text-primary-foreground px-6 py-2.5 rounded-2xl text-sm font-black shadow-lg shadow-primary/20">
              {pending.length} Pendentes
            </div>
          </div>
        </div>

        {/* Lista que agora entende o Dark Mode */}
        <DashboardList initialItems={pending} onRefresh={load} />
      </main>
    </div>
  );
}