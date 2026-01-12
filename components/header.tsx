"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import NotificationModal from "./notification-modal";

export default function Header() {
  const [user, setUser] = React.useState<any>(null);
  const [role, setRole] = React.useState<string>("USER");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);

  // Função isolada para buscar notificações (Engenharia de Reuso)
  const fetchNotifications = async (email: string) => {
    try {
      const res = await fetch(`/api/user/notifications?email=${email}`);
      if (!res.ok) throw new Error("Falha ao carregar notificações");
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error("Erro no Header (Notifications):", err);
    }
  };

  // Sincronização de Estado do Usuário e Dados Iniciais
  React.useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        
        try {
          const [roleRes] = await Promise.all([
            fetch(`/api/user/role?email=${session.user.email}`)
          ]);
          
          if (roleRes.ok) {
            const roleData = await roleRes.json();
            setRole(roleData.role);
          }

          // Busca notificações iniciais
          await fetchNotifications(session.user.email!);
        } catch (err) {
          console.warn("Erro ao buscar dados complementares:", err);
          setRole("USER");
        }
      }
    };

    checkUser();

    // Listener para mudanças de autenticação em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchNotifications(session.user.email!);
      } else {
        setRole("USER");
        setNotifications([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Lógica para o ponto vermelho de alerta
  const hasUnread = notifications.some((n: any) => !n.read);

  return (
    <>
      <header className="w-full border-b bg-white/80 backdrop-blur-md sticky top-0 z-40 border-slate-200">
        <div className="mx-auto max-w-6xl flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image 
              src="/logo.png" 
              alt="Logo Ecosol" 
              width={32} 
              height={32} 
              className="h-8 w-8 rounded-full object-cover" 
            />
            <div className="flex flex-col leading-tight">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 uppercase">ECOSOL</span>
              <span className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">Entre Autistas</span>
            </div>
          </Link>

          <nav className="flex items-center gap-3">
            {!user ? (
              <>
                <Link href="/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
                <Link href="/submit"><Button size="sm">Cadastrar Negócio</Button></Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                {/* Botão do Modal de Notificações */}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                  aria-label="Abrir notificações"
                >
                  <span className="text-xl">🔔</span>
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                  )}
                </button>

                {role === "ADMIN" && (
                  <Link href="/admin/dashboard" className="hidden sm:block">
                    <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                      Admin
                    </Button>
                  </Link>
                )}

                <Link href="/profile" title="Ver meu perfil">
                  <div className="w-9 h-9 rounded-full bg-blue-600 border border-blue-700 flex items-center justify-center text-white text-sm font-black uppercase shadow-sm hover:scale-105 transition-transform">
                    {user.email?.[0]}
                  </div>
                </Link>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout} 
                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Sair
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Modal de Notificações atualizado com props para limpeza */}
      <NotificationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        notifications={notifications}
        userEmail={user?.email || ""}
        onRefresh={() => fetchNotifications(user?.email || "")}
      />
    </>
  );
}