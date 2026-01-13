"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Button } from "./ui/button";
import NotificationModal from "./notification-modal";
import { 
  Bell, 
  LogOut, 
  User as UserIcon, 
  LayoutDashboard, 
  PlusCircle,
  ChevronDown 
} from "lucide-react";

export default function Header() {
  const [user, setUser] = React.useState<any>(null);
  const [role, setRole] = React.useState<string>("USER");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState([]);
  const [pendingCount, setPendingCount] = React.useState(0);

  const menuRef = React.useRef<HTMLDivElement>(null);

  // Fecha o menu ao clicar fora
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Carrega contagem de pendências (apenas para Admin)
  const loadAdminData = async () => {
    try {
      const res = await fetch('/api/admin/count');
      if (res.ok) {
        const { count } = await res.json();
        setPendingCount(count);
      }
    } catch (err) { console.error("Erro count:", err); }
  };

  // Carrega Role e Notificações
  const loadUserData = async (email: string) => {
    try {
      const [roleRes, notifyRes] = await Promise.all([
        fetch(`/api/user/role?email=${email}`),
        fetch(`/api/user/notifications?email=${email}`)
      ]);
      if (roleRes.ok) {
        const { role: userRole } = await roleRes.json();
        setRole(userRole);
        if (userRole === "ADMIN") loadAdminData();
      }
      if (notifyRes.ok) setNotifications(await notifyRes.json());
    } catch (err) { console.error("Erro data fetch:", err); }
  };

  // Inicialização do Auth e Monitoramento de Mudanças
  React.useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUser(session.user);
        loadUserData(session.user.email);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email) {
        setUser(session.user);
        loadUserData(session.user.email);
      } else {
        setUser(null);
        setRole("USER");
        setNotifications([]);
        setPendingCount(0);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const hasUnread = notifications.some((n: any) => !n.read);

  return (
    <>
      <header className="w-full border-b bg-white sticky top-0 z-40 border-slate-200 shadow-sm h-14">
        <div className="mx-auto max-w-6xl h-full flex items-center justify-between px-3 sm:px-4">
          
          {/* LOGO: Mantida exatamente como você enviou */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group shrink-0">
            <div className="relative h-7 w-7 sm:h-8 sm:w-8 overflow-hidden rounded-full border border-slate-100 group-hover:scale-105 transition-transform">
              <Image src="/logo.png" alt="Logo Ecosol" fill className="object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm sm:text-lg tracking-tighter text-slate-900 leading-none uppercase">ECOSOL</span>
              <span className="text-[6px] sm:text-[8px] text-blue-600 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em]">Entre Autistas</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {!user ? (
              <Link href="/login">
                <Button variant="ghost" className="font-bold text-slate-600 h-8 text-xs px-2">Entrar</Button>
              </Link>
            ) : (
              <div className="flex items-center gap-1 sm:gap-2">
                
                {/* BOTÃO ADMIN: Agora com etiqueta visível em todos os tamanhos */}
                {role === "ADMIN" && (
                  <Link href="/admin/dashboard" className="relative group">
                    <Button variant="outline" className="border-blue-100 text-blue-600 font-black h-8 px-1.5 sm:px-3 rounded-lg flex items-center gap-1">
                      <LayoutDashboard className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> 
                      <span className="text-[9px] uppercase tracking-tighter">Admin</span>
                    </Button>
                    {pendingCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center ring-2 ring-white animate-bounce">
                        {pendingCount}
                      </div>
                    )}
                  </Link>
                )}

                {/* BOTÃO NOVO NEGÓCIO: Etiqueta "Negócio" visível para caber no mobile */}
                <Link href="/submit">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white font-black h-8 px-1.5 sm:px-4 rounded-lg flex items-center gap-1">
                    <PlusCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> 
                    <span className="text-[9px] uppercase tracking-tighter">Negócio</span>
                  </Button>
                </Link>

                {/* NOTIFICAÇÕES */}
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="relative p-1.5 sm:p-2 text-slate-400 hover:text-blue-600 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-blue-600 rounded-full border-2 border-white"></span>
                  )}
                </button>

                {/* PERFIL MENU */}
                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1 p-0.5 pr-1 sm:pr-1.5 rounded-full border border-slate-100 hover:bg-slate-50 transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-black uppercase shadow-sm">
                      {user.email?.[0]}
                    </div>
                    <ChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''} hidden sm:block`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-50 overflow-hidden">
                      <div className="px-3 py-2 border-b border-slate-50 bg-slate-50/30">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sessão</p>
                        <p className="text-[10px] font-bold text-slate-700 truncate">{user.email}</p>
                      </div>
                      <div className="p-1 space-y-0.5">
                        {/* Atalho Admin no Mobile dentro do menu (opcional, mantido conforme seu código anterior) */}
                        {role === "ADMIN" && (
                          <Link 
                            href="/admin/dashboard" 
                            onClick={() => setIsUserMenuOpen(false)} 
                            className="sm:hidden flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <LayoutDashboard className="h-3.5 w-3.5" /> Painel Admin
                          </Link>
                        )}
                        <Link href="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                          <UserIcon className="h-3.5 w-3.5" /> Perfil
                        </Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <LogOut className="h-3.5 w-3.5" /> Sair
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      <NotificationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        notifications={notifications}
        userEmail={user?.email || ""}
        onRefresh={() => loadUserData(user?.email || "")}
      />
    </>
  );
}