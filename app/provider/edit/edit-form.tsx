"use client";
import * as React from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateServiceAction, deleteServiceAction } from "@/app/provider/actions";
import Image from "next/image";
import { 
  Loader2, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  MessageCircle, 
  Music2, 
  Globe,
  Check,
  ChevronsUpDown
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
import Swal from 'sweetalert2';

// Importação da lista padronizada
import { SERVICE_CATEGORIES } from "@/src/constants/categories";

/**
 * Ícone do Instagram em SVG (Evita o deprecated do Lucide)
 */
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function EditServiceForm({ service }: { service: any }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [error, setError] = React.useState("");
  
  const [formData, setFormData] = React.useState({
    name: service.name || "",
    category: service.category || "",
    description: service.description || "",
    image: service.image || "",
    whatsapp: service.whatsapp || "",
    instagram: service.instagram || "",
    tiktok: service.tiktok || "",
    email: service.email || "", 
    site: service.site || "",
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(service.image);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const maskPhone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1");
  };

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError("");
      const fileExt = file.name.split('.').pop();
      const fileName = `${service.id}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(fileName);
      setFormData({ ...formData, image: publicUrl });
      setImagePreview(publicUrl);
    } catch (err: any) {
      setError("Erro no upload: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const normalizedData = {
        ...formData,
        category: formData.category.trim().toLowerCase()
      };

      const result = await updateServiceAction(service.id, normalizedData);
      
      if (result.success) {
        await Swal.fire({
          title: 'Sucesso!',
          text: 'As alterações foram salvas com sucesso.',
          icon: 'success',
          confirmButtonColor: 'hsl(var(--primary))',
          customClass: { popup: 'rounded-[2rem] bg-card text-foreground border border-border' }
        });
        router.push(`/provider/${service.id}`);
        router.refresh();
      } else {
        setError("Não foi possível salvar as alterações.");
        setLoading(false);
      }
    } catch (err) {
      setError("Falha na comunicação com o servidor.");
      setLoading(false);
    }
  }

  async function handleDelete() {
    const result = await Swal.fire({
      title: 'Tem certeza?',
      text: "Deseja excluir permanentemente este cadastro? Esta ação é irreversível.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'hsl(var(--destructive))',
      cancelButtonColor: 'hsl(var(--muted))',
      confirmButtonText: 'Sim, excluir permanentemente',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      customClass: {
        popup: 'rounded-[2rem] bg-card text-foreground border border-border',
        confirmButton: 'rounded-xl font-bold py-3 px-6',
        cancelButton: 'rounded-xl font-bold py-3 px-6'
      }
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      setError("");
      try {
        const result = await deleteServiceAction(service.id);
        if (result.success) {
          await Swal.fire({
            title: 'Excluído!',
            text: 'O cadastro foi removido do sistema.',
            icon: 'success',
            confirmButtonColor: 'hsl(var(--primary))',
            customClass: { popup: 'rounded-[2rem] bg-card text-foreground border border-border' }
          });
          router.push("/");
          router.refresh();
        } else {
          setError("Não foi possível excluir o cadastro.");
          setIsDeleting(false);
        }
      } catch (err) {
        setError("Erro ao processar a exclusão.");
        setIsDeleting(false);
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-destructive/10 border-l-4 border-destructive p-4 text-destructive text-xs font-bold rounded-lg animate-in fade-in flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="space-y-3">
        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Logo ou Foto do Negócio</label>
        <input type="file" id="image-upload" accept="image/*" onChange={handleImageChange} className="hidden" ref={fileInputRef} disabled={uploading || isDeleting} />

        {!imagePreview ? (
          <label 
            htmlFor="image-upload" 
            className="group flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-border rounded-[2rem] cursor-pointer bg-muted/20 hover:bg-primary/5 transition-all duration-300"
          >
            {uploading ? <Loader2 className="w-10 h-10 animate-spin text-primary" /> : <UploadCloud className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-all" />}
            <p className="mt-4 text-sm text-muted-foreground group-hover:text-primary font-bold">Carregar imagem</p>
          </label>
        ) : (
          <div className="relative w-full h-64 rounded-[2rem] overflow-hidden border-4 border-card shadow-2xl group">
            <Image src={imagePreview} alt="Preview" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
              <label htmlFor="image-upload" className="bg-primary text-primary-foreground font-black px-6 py-2 rounded-full text-[10px] uppercase cursor-pointer hover:scale-110 transition-transform">Trocar</label>
              <button type="button" onClick={removeImage} className="bg-destructive text-destructive-foreground font-black px-6 py-2 rounded-full text-[10px] uppercase hover:scale-110 transition-transform">Remover</button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Nome do negócio *</label>
            <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-14 rounded-2xl border-border bg-muted/30 focus:bg-background transition-all font-bold text-lg" disabled={loading || isDeleting} />
          </div>

          <div className="space-y-2 flex flex-col">
            <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 mb-0.5">Categoria *</label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={loading || isDeleting}
                  className={cn(
                    "h-14 justify-between rounded-2xl bg-muted/30 border-border text-lg font-bold hover:bg-muted/40 transition-all",
                    !formData.category && "text-muted-foreground" // CORREÇÃO: Placeholder em cinza
                  )}
                >
                  {formData.category
                    ? SERVICE_CATEGORIES.find((cat) => cat.value === formData.category)?.label
                    : "Pesquisar categoria..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0 rounded-[2rem] border-border shadow-2xl" align="start">
                <Command className="rounded-[2rem]">
                  <CommandInput placeholder="Digite para buscar..." className="h-12" />
                  <CommandList className="max-h-64">
                    <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                    <CommandGroup>
                      {SERVICE_CATEGORIES.map((cat) => (
                        <CommandItem
                          key={cat.value}
                          value={cat.label}
                          onSelect={() => {
                            setFormData({ ...formData, category: cat.value });
                            setOpen(false);
                          }}
                          className="font-bold py-3 cursor-pointer"
                        >
                          <Check className={cn("mr-2 h-4 w-4", formData.category === cat.value ? "opacity-100" : "opacity-0")} />
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
          <label className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Descrição detalhada *</label>
          <textarea 
            className="w-full min-h-[160px] rounded-[2rem] border border-border bg-muted/30 p-6 text-base font-medium text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none shadow-inner"
            required
            disabled={loading || isDeleting}
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <MessageCircle size={14} className="text-green-500" /> WhatsApp
            </label>
            <Input value={formData.whatsapp} disabled={loading || isDeleting} onChange={(e) => setFormData({ ...formData, whatsapp: maskPhone(e.target.value) })} className="h-14 rounded-2xl border-border bg-muted/30 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <InstagramIcon className="text-pink-500" /> Instagram
            </label>
            <Input placeholder="@usuario" disabled={loading || isDeleting} value={formData.instagram} onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} className="h-14 rounded-2xl border-border bg-muted/30 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <Music2 size={14} /> TikTok
            </label>
            <Input placeholder="@tiktok" disabled={loading || isDeleting} value={formData.tiktok} onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })} className="h-14 rounded-2xl border-border bg-muted/30 font-bold" />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <Globe size={14} className="text-primary" /> Site Oficial
            </label>
            <Input placeholder="https://..." disabled={loading || isDeleting} value={formData.site} onChange={(e) => setFormData({ ...formData, site: e.target.value })} className="h-14 rounded-2xl border-border bg-muted/30 font-bold" />
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-col gap-4 border-t border-border">
        <div className="flex gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()} className="flex-1 h-16 rounded-[2rem] font-bold text-muted-foreground hover:bg-muted" disabled={loading || isDeleting}>Cancelar</Button>
          <Button type="submit" disabled={loading || uploading || isDeleting} className="flex-[2] h-16 rounded-[2rem] font-black text-lg shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
            {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 size={20} className="mr-2" />}
            Confirmar Alterações
          </Button>
        </div>
        <Button type="button" onClick={handleDelete} disabled={loading || isDeleting} variant="outline" className="h-16 rounded-[2rem] border-destructive/20 text-destructive hover:bg-destructive/10 font-bold transition-all flex items-center justify-center gap-2"><Trash2 size={18} /> Excluir permanentemente</Button>
      </div>
    </form>
  );
}