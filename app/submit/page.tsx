"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Loader2,
  UploadCloud,
  CheckCircle2,
  Globe,
  MessageCircle,
  Music2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import Swal from "sweetalert2";

// --- Importação da Logística de Estilo e Notificações Padronizada ---
import { swalConfig } from "@/lib/swal";
import { notify, Toast } from "@/lib/toast";
import { SERVICE_CATEGORIES } from "@/constants/categories";

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function SubmitPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  const [form, setForm] = React.useState({
    name: "",
    category: "",
    description: "",
    whatsapp: "",
    instagram: "",
    tiktok: "",
    site: "",
  });

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, whatsapp: maskPhone(e.target.value) });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        // Uso do Toast Padronizado com brilho Neon
        Toast.fire({
          icon: "error",
          title: "Arquivo muito grande",
          text: "Limite de 2MB.",
        });
        return;
      }
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  React.useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setUserEmail(session.user.email || null);
    };
    getSession();
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [router, imagePreview]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!userEmail) return;

    setIsSubmitting(true);

    // 1. Modal de Sincronização Neon Centralizado
    Swal.fire({
      ...swalConfig,
      title: "Sincronizando...",
      text: "Enviando seu negócio para análise da curadoria.",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      let imageUrl = "";

      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `logos/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from("logos")
          .upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const {
          data: { publicUrl },
        } = supabase.storage.from("logos").getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          image: imageUrl,
          email: userEmail,
          category: form.category.trim().toLowerCase(),
        }),
      });

      // 2. GESTOR AUTOMÁTICO: Fecha Swal e dispara Toast Neon de Sucesso/Erro
      notify.auto(
        res.ok,
        "Sucesso! Cadastro enviado para curadoria.",
        "Não foi possível completar o envio."
      );

      if (res.ok) {
        router.push("/");
      }
    } catch (error) {
      console.error("Erro ao enviar novo negócio:", error);
      // 3. Notificação de erro automática em caso de crash
      notify.error("Ocorreu um erro inesperado no servidor.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 transition-colors duration-300">
      <Header />
      <main className="mx-auto max-w-3xl p-6 py-12">
        <div className="bg-card p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-border mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <header className="mb-10 text-center sm:text-left">
            <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase leading-none">
              Novo Negócio
            </h2>
            <p className="text-muted-foreground font-medium mt-3">
              Divulgue seu trabalho para toda a rede{" "}
              <span className="text-primary font-bold">Ecosol</span>.
            </p>
          </header>

          <form onSubmit={submit} className="space-y-8">
            {/* JSX de Formulário Integralmente Preservado */}
            <div className="space-y-3">
              <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">
                Logo ou Foto do Negócio
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                ref={fileInputRef}
                disabled={isSubmitting}
              />

              {!imagePreview ? (
                <label
                  htmlFor="image-upload"
                  className="group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-border rounded-[2.5rem] cursor-pointer bg-muted/20 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
                >
                  <UploadCloud className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-all duration-300" />
                  <p className="mt-4 text-sm text-muted-foreground group-hover:text-primary font-bold">
                    Carregar imagem
                  </p>
                </label>
              ) : (
                <div className="relative w-full h-64 rounded-[2.5rem] overflow-hidden border-4 border-card shadow-2xl group">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                    <label
                      htmlFor="image-upload"
                      className="bg-primary text-primary-foreground font-black px-6 py-2 rounded-full text-[10px] uppercase cursor-pointer hover:scale-110 transition-transform"
                    >
                      Trocar
                    </label>
                    <button
                      type="button"
                      onClick={removeImage}
                      className="bg-destructive text-destructive-foreground font-black px-6 py-2 rounded-full text-[10px] uppercase hover:scale-110 transition-transform"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  Nome do Negócio
                </label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  disabled={isSubmitting}
                  className="h-14 rounded-2xl bg-muted/30 focus:bg-background border-border text-lg font-bold"
                  placeholder="Nome comercial"
                />
              </div>

              <div className="space-y-2 flex flex-col">
                <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 mb-0.5">
                  Categoria
                </label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      disabled={isSubmitting}
                      className={cn(
                        "h-14 justify-between rounded-2xl bg-muted/30 border-border text-lg font-bold hover:bg-muted/40 transition-all",
                        !form.category && "text-muted-foreground"
                      )}
                    >
                      {form.category
                        ? SERVICE_CATEGORIES.find(
                            (cat) => cat.value === form.category
                          )?.label
                        : "Pesquisar categoria..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full p-0 rounded-4xl border-border shadow-2xl"
                    align="start"
                  >
                    <Command className="rounded-4xl">
                      <CommandInput
                        placeholder="Digite para buscar..."
                        className="h-12"
                      />
                      <CommandList className="max-h-64">
                        <CommandEmpty>
                          Nenhuma categoria encontrada.
                        </CommandEmpty>
                        <CommandGroup>
                          {SERVICE_CATEGORIES.map((cat) => (
                            <CommandItem
                              key={cat.value}
                              value={cat.label}
                              onSelect={() => {
                                setForm({ ...form, category: cat.value });
                                setOpen(false);
                              }}
                              className="font-bold py-3 cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  form.category === cat.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {cat.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                Descrição dos Serviços
              </label>
              <textarea
                className="w-full min-h-40 rounded-4xl border border-border bg-muted/30 p-6 text-base font-medium text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none shadow-inner"
                required
                disabled={isSubmitting}
                placeholder="Descreva o que seu negócio oferece..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  <MessageCircle className="w-3.5 h-3.5 text-green-500" />{" "}
                  WhatsApp
                </label>
                <Input
                  placeholder="(00) 00000-0000"
                  disabled={isSubmitting}
                  value={form.whatsapp}
                  onChange={handlePhoneChange}
                  className="h-14 rounded-2xl bg-muted/30 border-border font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  <InstagramIcon className="text-pink-500" /> Instagram
                </label>
                <Input
                  placeholder="@seu.perfil"
                  disabled={isSubmitting}
                  value={form.instagram}
                  onChange={(e) =>
                    setForm({ ...form, instagram: e.target.value })
                  }
                  className="h-14 rounded-2xl bg-muted/30 border-border font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  <Music2 className="w-3.5 h-3.5 text-foreground" /> TikTok
                </label>
                <Input
                  placeholder="@seu.tiktok"
                  disabled={isSubmitting}
                  value={form.tiktok}
                  onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                  className="h-14 rounded-2xl bg-muted/30 border-border font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
                  <Globe className="w-3.5 h-3.5 text-primary" /> Site /
                  Portfólio
                </label>
                <Input
                  placeholder="https://..."
                  disabled={isSubmitting}
                  value={form.site}
                  onChange={(e) => setForm({ ...form, site: e.target.value })}
                  className="h-14 rounded-2xl bg-muted/30 border-border font-bold"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !userEmail}
              className="w-full mt-6 h-16 rounded-4xl font-black text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Sincronizando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Solicitar Cadastro</span>
                </div>
              )}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
