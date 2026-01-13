"use client";
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "next-themes";
import Link from "next/link";
import { 
  Loader2, 
  Mail, 
  Lock, 
  Sun, 
  Moon, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  UserCircle2,
  KeyRound,
  ArrowLeft
} from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 1. Autenticação Primária via Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setMessage({ type: 'error', text: "E-mail ou senha incorretos." });
      setLoading(false);
      return;
    }

    // 2. Verificação de Role via API (Engenharia de Redirecionamento)
    try {
      const res = await fetch(`/api/user/role?email=${email}`);
      if (!res.ok) throw new Error("Falha ao validar permissões");
      
      const { role } = await res.json();
      router.refresh(); // Sincroniza cookies/sessão com o Middleware

      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      console.error("Erro na busca de role:", err);
      router.push("/");
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: "Link de recuperação enviado ao seu e-mail." });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4 transition-colors duration-500">
      
      {/* Botão de Tema Flutuante */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="fixed top-6 right-6 p-3 bg-card border border-border rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all text-primary"
      >
        {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-border">
          
          {/* Cabeçalho de Identidade */}
          <div className="text-center mb-10">
            <div className="inline-flex p-4 bg-primary/10 rounded-[1.5rem] mb-5 text-primary">
               {isResetting ? <KeyRound size={32} /> : <UserCircle2 size={32} />}
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase leading-none">
              {isResetting ? "Recuperar" : "Bem-vindo"}
            </h1>
            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.3em] mt-3">
              {isResetting ? "Redefinição de Acesso" : "Rede Ecosol Autista"}
            </p>
          </div>

          {/* Mensagens de Feedback */}
          {message && (
            <div className={`mb-8 p-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border flex items-center gap-3 animate-in slide-in-from-top-2 ${
              message.type === 'success' 
                ? 'bg-primary/10 border-primary/20 text-primary' 
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {message.text}
            </div>
          )}

          <form onSubmit={isResetting ? handleForgotPassword : handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] ml-1">E-mail de Acesso</label>
              <div className="relative">
                <Input 
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="seu@email.com"
                  className="h-14 pl-12 rounded-2xl bg-muted/30 border-border focus:bg-background font-bold transition-all"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={18} />
              </div>
            </div>

            {!isResetting && (
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em]">Senha</label>
                  <button 
                    type="button"
                    onClick={() => { setIsResetting(true); setMessage(null); }}
                    className="text-[10px] font-black text-primary hover:opacity-70 uppercase tracking-widest transition-all"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <Input 
                    type="password" 
                    required 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="h-14 pl-12 rounded-2xl bg-muted/30 border-border focus:bg-background font-bold transition-all"
                  />
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={18} />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-16 rounded-[2rem] font-black text-lg shadow-lg shadow-primary/20 gap-3 transition-all active:scale-[0.98]" 
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" /> : <ArrowRight size={20} />}
              {loading ? "Processando..." : (isResetting ? "Enviar Link" : "Entrar na Rede")}
            </Button>

            {isResetting && (
              <button 
                type="button" 
                className="w-full flex items-center justify-center gap-2 text-[10px] font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-all mt-4"
                onClick={() => { setIsResetting(false); setMessage(null); }}
              >
                <ArrowLeft size={12} /> Voltar ao Login
              </button>
            )}
          </form>

          {!isResetting && (
            <div className="mt-10 text-center border-t border-border pt-8">
              <p className="text-xs text-muted-foreground font-medium">
                Ainda não faz parte?{" "}
                <Link href="/signup" className="text-primary font-black hover:underline underline-offset-4">
                  Criar minha conta
                </Link>
              </p>
            </div>
          )}
        </div>
        
        {/* Footer de Segurança */}
        <p className="text-center mt-8 text-[9px] text-muted-foreground/30 font-black uppercase tracking-[0.4em]">
          Ambiente Seguro Ecosol &bull; 2026
        </p>
      </div>
    </div>
  );
}