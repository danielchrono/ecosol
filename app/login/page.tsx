"use client";
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const router = useRouter();

  // Lógica de Login com Tratamento de Role (Engenharia de Software)
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // 1. Autenticação Primária
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setMessage({ type: 'error', text: "E-mail ou senha incorretos." });
      setLoading(false);
      return;
    }

    // 2. Verificação de Role via API
    try {
      const res = await fetch(`/api/user/role?email=${email}`);
      if (!res.ok) throw new Error("Falha ao validar permissões");
      
      const { role } = await res.json();

      // Força a atualização dos cookies para que o Middleware reconheça a nova sessão
      router.refresh();

      // Redirecionamento baseado em privilégios
      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/profile");
      }
    } catch (err) {
      console.error("Erro na busca de role:", err);
      // Fallback seguro: manda para o home se a API de role falhar
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
      setMessage({ type: 'success', text: "Link enviado! Verifique sua caixa de entrada." });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-2xl border border-slate-100 transition-all">
        
        {/* Identidade Visual Ecosol */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-blue-50 rounded-2xl mb-4">
             <span className="text-3xl">👤</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isResetting ? "Recuperar Senha" : "Acesse o Ecosol"}
          </h1>
          <p className="text-slate-500 text-sm mt-2">
            {isResetting 
              ? "Enviaremos as instruções para o seu e-mail." 
              : "Conecte-se à rede de economia solidária autista."}
          </p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-bold border animate-in fade-in duration-300 ${
            message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            {message.type === 'success' ? '✅ ' : '⚠️ '}{message.text}
          </div>
        )}

        <form onSubmit={isResetting ? handleForgotPassword : handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Seu E-mail</label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="exemplo@email.com"
              className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
            />
          </div>

          {!isResetting && (
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sua Senha</label>
                <button 
                  type="button"
                  onClick={() => { setIsResetting(true); setMessage(null); }}
                  className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                >
                  Esqueceu?
                </button>
              </div>
              <Input 
                type="password" 
                required 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                className="h-12 rounded-xl border-slate-200 focus:ring-blue-500"
              />
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 rounded-xl font-bold shadow-lg shadow-blue-100 transition-all active:scale-95" 
            disabled={loading}
          >
            {loading ? "Aguarde..." : (isResetting ? "Enviar Link de Recuperação" : "Entrar")}
          </Button>

          {isResetting && (
            <button 
              type="button" 
              className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 mt-2"
              onClick={() => { setIsResetting(false); setMessage(null); }}
            >
              Voltar para o Login
            </button>
          )}
        </form>

        {!isResetting && (
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">
              Ainda não tem conta?{" "}
              <Link href="/signup" className="text-blue-600 font-bold hover:underline">
                Cadastre-se aqui
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}