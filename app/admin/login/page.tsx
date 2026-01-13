"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";
import { useTheme } from "next-themes";
import { 
  ShieldCheck, 
  Lock, 
  Loader2, 
  Sun, 
  Moon, 
  ArrowRight, 
  AlertCircle 
} from "lucide-react";

export default function AdminLogin() {
  const [pass, setPass] = React.useState("");
  const [error, setError] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await loginAction(pass);

    if (result.success) {
      router.push("/admin/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Acesso negado");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 transition-colors duration-500">
      
      {/* Botão de Tema Flutuante (Substituindo o Header) */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 p-3 bg-card border border-border rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all text-primary"
        title="Alternar Tema"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <main className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        
        {/* Identidade Ecosol de Login */}
        <div className="text-center mb-8 space-y-2">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center text-primary mb-4 shadow-sm">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">
            Área Restrita
          </h1>
          <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em]">
            Controle Administrativo Ecosol
          </p>
        </div>

        <div className="bg-card p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-border">
          <form onSubmit={handleSubmit} className="grid gap-6">
            
            {/* Estado de Erro Semântico */}
            {error && (
              <div className="bg-destructive/10 border-l-4 border-destructive p-4 text-destructive text-xs font-bold rounded-lg animate-in slide-in-from-top-2 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Chave de Segurança</label>
              <div className="relative">
                <Input
                  placeholder="Digite sua senha"
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                  disabled={isSubmitting}
                  className="h-14 pl-12 rounded-2xl bg-muted/30 border-border focus:bg-background font-bold text-lg"
                />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/40" size={20} />
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full h-16 rounded-[2rem] font-black text-lg shadow-lg shadow-primary/20 gap-3 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>Entrar no Painel <ArrowRight size={20} /></>
              )}
            </Button>
          </form>
        </div>

        {/* Rodapé de Segurança */}
        <p className="text-center mt-8 text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest">
          Sessão monitorada e protegida por criptografia SSR
        </p>
      </main>
    </div>
  );
}