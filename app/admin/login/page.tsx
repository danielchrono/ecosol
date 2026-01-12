"use client";
import * as React from "react";
import Header from "@/components/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions"; // Importe a action

export default function AdminLogin() {
  const [pass, setPass] = React.useState("");
  const [error, setError] = React.useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const result = await loginAction(pass);

    if (result.success) {
      // Agora o Middleware vai reconhecer o cookie HttpOnly
      router.push("/admin/dashboard");
      router.refresh(); // Garante que o Next limpe o cache de rotas protegidas
    } else {
      setError(result.error || "Erro ao entrar");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-md p-6 mt-10">
        <div className="bg-white p-8 rounded-xl shadow-sm border">
          <h2 className="text-2xl font-bold text-center">Painel Admin</h2>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <Input
              placeholder="Senha de acesso"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
            />
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
              Entrar
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}