"use client";
import * as React from "react";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/service-card";

export default function AdminDashboard() {
  const [pending, setPending] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  async function load() {
    try {
      const res = await fetch("/api/admin/pending");
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      setPending(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  // Removido a checagem de sessionStorage, o Middleware cuida disso!
  React.useEffect(() => {
    load();
  }, []);

  async function approve(id: number) {
    const res = await fetch("/api/admin/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) load();
  }

  async function action(id: number, type: "suspend" | "remove") {
    const res = await fetch("/api/admin/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type }),
    });
    if (res.ok) load();
  }

  if (loading) return <div className="p-10 text-center">Carregando painel...</div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-6xl p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Painel de Controle</h2>
            <p className="text-slate-600">Gerencie as solicitações pendentes</p>
          </div>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            {pending.length} Pendentes
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pending.length === 0 ? (
            <div className="col-span-full bg-white p-12 rounded-xl border border-dashed text-center text-slate-500">
              Não há serviços aguardando aprovação.
            </div>
          ) : (
            pending.map((p) => (
              <div key={p.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                {/* Sanitização dos dados para o ServiceCard não quebrar */}
                <ServiceCard service={{
                  ...p,
                  whatsapp: p.whatsapp ?? undefined,
                  instagram: p.instagram ?? undefined,
                  tiktok: p.tiktok ?? undefined,
                  email: p.email ?? undefined,
                  site: p.site ?? undefined,
                }} />
                
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <Button 
                    onClick={() => approve(p.id)}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Aprovar Serviço
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => action(p.id, "suspend")}
                      variant="outline"
                      className="flex-1"
                    >
                      Suspender
                    </Button>
                    <Button 
                      onClick={() => action(p.id, "remove")}
                      variant="destructive"
                      className="flex-1"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}