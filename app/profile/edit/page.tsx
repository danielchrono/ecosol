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
        } catch (err) { console.error("Erro na carga do perfil:", err); }
      }
      setLoading(false);
    }
    loadInitialData();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    Swal.fire({
      title: 'Sincronizando...',
      text: 'Atualizando seus dados na rede.',
      didOpen: () => { Swal.showLoading(); },
      allowOutsideClick: false,
      customClass: { popup: 'rounded-[2rem] bg-card text-foreground border border-border' }
    });

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: userEmail }),
      });

      if (res.ok) {
        Swal.close();
        Toast.fire({ 
          icon: 'success', 
          title: 'Perfil atualizado!',
          background: 'hsl(var(--card))',
          color: 'hsl(var(--foreground))'
        });
        router.push("/profile");
        router.refresh(); 
      } else {
        throw new Error();
      }
    } catch (err) {
      setSaving(false);
      Swal.fire({ 
        icon: 'error', 
        title: 'Erro ao salvar',
        customClass: { popup: 'rounded-[2rem] bg-card text-foreground' }
      });
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="font-black text-muted-foreground uppercase tracking-widest text-[10px] animate-pulse">
          Carregando Perfil...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 pb-20">
      <Header />
      <main className="max-w-2xl mx-auto p-6 py-12">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="mb-8 hover:bg-card rounded-full gap-2 text-muted-foreground font-black uppercase text-[10px] tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar
        </Button>

        <form 
          onSubmit={handleSubmit} 
          className="bg-card p-8 md:p-12 rounded-[2.5rem] border border-border shadow-xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <header className="space-y-1">
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
              Editar Perfil
            </h2>
            <p className="text-muted-foreground font-medium text-sm">
              Mantenha seus dados de contato atualizados na rede <span className="text-primary font-bold">Ecosol</span>.
            </p>
          </header>

          <div className="space-y-8">
            {/* Campo: Nome */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] ml-1">
                <User className="w-3.5 h-3.5" /> Nome Completo
              </label>
              <Input 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
                className="h-14 rounded-2xl bg-muted/30 focus:bg-background border-border font-bold text-base transition-all"
                placeholder="Como você quer ser chamado?"
              />
            </div>

            {/* Campo: WhatsApp */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] ml-1">
                <Phone className="w-3.5 h-3.5" /> WhatsApp Comercial
              </label>
              <Input 
                value={form.phone} 
                onChange={e => setForm({...form, phone: formatPhoneNumber(e.target.value)})} 
                className="h-14 rounded-2xl bg-muted/30 focus:bg-background border-border font-bold text-base transition-all"
                placeholder="(00) 00000-0000"
                maxLength={15}
              />
            </div>

            {/* Campo: Bio / Descrição */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] ml-1">
                <FileText className="w-3.5 h-3.5" /> Bio / Descrição Pessoal
              </label>
              <textarea 
                className="w-full border border-border bg-muted/30 rounded-3xl p-6 text-base font-medium h-44 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-inner text-foreground placeholder:text-muted-foreground/40 resize-none"
                placeholder="Conte um pouco sobre você..."
                value={form.bio} 
                onChange={e => setForm({...form, bio: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4">
             <Button 
               type="submit" 
               className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-[2rem] h-16 font-black text-lg shadow-lg shadow-primary/20 gap-3 transition-all active:scale-[0.98]" 
               disabled={saving}
             >
               {saving ? <Loader2 className="animate-spin" /> : <Save className="w-5 h-5" />}
               {saving ? "Salvando Dados..." : "Confirmar Alterações"}
             </Button>
          </div>
        </form>
      </main>
    </div>
  );
}