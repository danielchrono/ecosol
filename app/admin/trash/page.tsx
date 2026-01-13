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

  async function loadTrashed() {
    try {
      const res = await fetch("/api/admin/trash"); // Certifique-se de que esta rota retorna os deletados
      if (res.ok) {
        const data = await res.json();
        setItems(data);
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <Header />
      <main className="mx-auto max-w-5xl p-6 py-12">
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <Link href="/admin/dashboard" className="group flex items-center gap-2 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-4">
              <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" /> Dashboard
            </Link>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              Lixeira <span className="text-slate-300 font-light">|</span> <Trash2 className="text-slate-400 w-8 h-8" />
            </h1>
            <p className="text-slate-500 font-medium">Recupere ou elimine dados permanentemente.</p>
          </div>
          
          <div className="bg-slate-900 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">
            {items.length} Itens no Limbo
          </div>
        </div>

        <TrashList items={items} onRefresh={loadTrashed} />
      </main>
    </div>
  );
}