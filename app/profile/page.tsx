"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import { supabase } from "@/lib/supabase";
import { Loader2, Save, ArrowLeft, User, Phone, FileText } from "lucide-react";
import Swal from 'sweetalert2';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true
});

const formatPhoneNumber = (value: string) => {
  if (!value) return value;
  const phoneNumber = value.replace(/[^\d]/g, "");
  const len = phoneNumber.length;
  if (len < 3) return phoneNumber;
  if (len < 7) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
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
        } catch (err) { console.error(err); }
      }
      setLoading(false);
    }
    loadInitialData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    Swal.fire({
      title: 'Salvando...',
      didOpen: () => { Swal.showLoading(); },
      allowOutsideClick: false,
      customClass: { popup: 'rounded-[2rem]' }
    });

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, email: userEmail }),
    });

    if (res.ok) {
      Swal.close();
      Toast.fire({ icon: 'success', title: 'Perfil atualizado!' });
      router.push("/profile");
      router.refresh(); 
    } else {
      setSaving(false);
      Swal.fire({ icon: 'error', title: 'Erro ao salvar' });
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      <main className="max-w-2xl mx-auto p-6 py-12">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-6 hover:bg-white rounded-full gap-2 text-slate-500 font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>

        <form onSubmit={handleSubmit} className="bg-white p-8 md:p-12 rounded-[2.5rem] border-none shadow-2xl shadow-slate-200/50 space-y-8">
          <header>
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Editar Perfil</h2>
            <p className="text-slate-500 font-medium">Suas informações na rede Ecosol.</p>
          </header>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <User className="w-3 h-3" /> Nome Completo
              </label>
              <Input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white font-bold text-base"
                placeholder="Como você quer ser chamado?"
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <Phone className="w-3 h-3" /> WhatsApp
              </label>
              <Input 
                value={form.phone} 
                onChange={e => setForm({...form, phone: formatPhoneNumber(e.target.value)})} 
                className="h-14 rounded-2xl border-slate-100 bg-slate-50 font-bold text-base"
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                <FileText className="w-3 h-3" /> Bio / Descrição
              </label>
              <textarea 
                className="w-full border-0 bg-slate-50 rounded-[1.5rem] p-5 text-base font-medium h-40 outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                placeholder="Conte um pouco sobre você ou seu trabalho..."
                value={form.bio} 
                onChange={e => setForm({...form, bio: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-4">
             <Button 
               type="submit" 
               className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-2xl h-14 font-black text-lg shadow-xl shadow-blue-200 gap-2" 
               disabled={saving}
             >
               {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
               Salvar Alterações
             </Button>
          </div>
        </form>
      </main>
    </div>
  );
}