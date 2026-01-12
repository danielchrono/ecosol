"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { supabase } from "@/lib/supabase";

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const phoneNumberLength = phoneNumber.length;
  if (phoneNumberLength < 3) return phoneNumber;
  if (phoneNumberLength < 7) {
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
  }
  return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

export default function EditProfile() {
  const [form, setForm] = React.useState({ name: "", phone: "", bio: "" });
  const [userEmail, setUserEmail] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    async function loadInitialData() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user?.email) {
        setUserEmail(user.email);
        
        try {
          const res = await fetch(`/api/user/profile?email=${user.email}`);
          if (res.ok) {
            const data = await res.json();
            setForm({
              name: data.name || "",
              phone: data.phone || "",
              bio: data.bio || ""
            });
          }
        } catch (err) {
          console.error("Erro ao carregar perfil:", err);
        }
      }
      setLoading(false);
    }

    loadInitialData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, email: userEmail }),
    });

    if (res.ok) {
      router.push("/profile");
      router.refresh(); 
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-slate-500 animate-pulse font-bold uppercase tracking-widest text-xs">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="max-w-2xl mx-auto p-6 py-12">
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-3xl border shadow-xl space-y-6">
          <div className="border-b pb-4">
            <h2 className="text-2xl font-black text-slate-900">Editar Perfil</h2>
            <p className="text-slate-500 text-sm">Atualize suas informações para a rede Ecosol.</p>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <Input 
              placeholder="Digite aqui seu nome completo" 
              value={form.name} 
              onChange={e => setForm({...form, name: e.target.value})} 
              className="rounded-xl border-slate-200 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">WhatsApp</label>
            <Input 
              placeholder="Ex: (11) 99999-9999" 
              value={form.phone} 
              onChange={e => {
                const formatted = formatPhoneNumber(e.target.value);
                setForm({...form, phone: formatted});
              }} 
              className="rounded-xl border-slate-200 focus:ring-blue-500"
              maxLength={15}
            />
          </div> {/* <--- ESSA TAG ESTAVA FALTANDO */}

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Bio / Sobre Mim</label>
            <textarea 
              className="w-full border border-slate-200 rounded-2xl p-4 text-sm h-40 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Descreva seu trabalho ou sua história..."
              value={form.bio} 
              onChange={e => setForm({...form, bio: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3">
             <Button 
               type="button" 
               variant="ghost" 
               className="flex-1 rounded-xl text-slate-400"
               onClick={() => router.back()}
             >
               Cancelar
             </Button>
             <Button 
               type="submit" 
               className="flex-[2] bg-blue-600 hover:bg-blue-700 rounded-xl h-12 font-bold shadow-lg shadow-blue-200 transition-all" 
               disabled={saving}
             >
               {saving ? "Salvando..." : "Salvar Alterações"}
             </Button>
          </div>
        </form>
      </main>
    </div>
  );
}