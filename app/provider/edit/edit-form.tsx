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
  Instagram, 
  MessageCircle, 
  Music2, 
  Globe 
} from "lucide-react";
import Swal from 'sweetalert2';

export default function EditServiceForm({ service }: { service: any }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
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

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

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
      const result = await updateServiceAction(service.id, formData);
      
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
      text: "Você deseja excluir permanentemente este cadastro? Esta ação não pode ser desfeita.",
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

      {/* ÁREA DE UPLOAD ADAPTATIVA */}
      <div className="grid gap-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1 mb-1 block">Logotipo ou Foto de Capa</label>
        <input 
          type="file" 
          id="image-upload" 
          accept="image/*" 
          onChange={handleImageChange} 
          className="hidden"
          ref={fileInputRef}
          disabled={uploading || isDeleting}
        />

        {!imagePreview ? (
          <label 
            htmlFor="image-upload" 
            className="group flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border rounded-2xl cursor-pointer bg-muted/20 hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
          >
            <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-all mb-2" />
            <p className="text-sm text-muted-foreground group-hover:text-primary font-bold">Clique para carregar foto</p>
            <p className="text-[10px] text-muted-foreground/40 mt-1 uppercase tracking-widest">PNG, JPG ou GIF (Máx. 2MB)</p>
          </label>
        ) : (
          <div className="relative w-full h-56 rounded-3xl overflow-hidden border-2 border-border group shadow-inner">
            <Image src={imagePreview} alt="Preview" fill className="object-cover transition-opacity group-hover:opacity-80" />
            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
              <label htmlFor="image-upload" className="cursor-pointer bg-primary text-primary-foreground font-black px-5 py-2 rounded-full text-[10px] uppercase shadow-sm hover:scale-105 transition-transform">
                Trocar foto
              </label>
              <button type="button" onClick={removeImage} className="bg-destructive text-destructive-foreground font-black px-5 py-2 rounded-full text-[10px] uppercase shadow-sm hover:scale-105 transition-transform">
                Remover
              </button>
            </div>
            {(uploading || isDeleting) && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center transition-all z-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Nome do negócio *</label>
            <Input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-all font-bold" placeholder="Ex: Consultoria Silva" />
          </div>

          <div className="grid gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Categoria *</label>
            <Input required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-all font-bold" placeholder="Ex: Tecnologia, Artesanato..." />
          </div>
        </div>

        <div className="grid gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">Descrição detalhada *</label>
          <textarea 
            className="w-full min-h-[160px] rounded-3xl border border-border bg-muted/30 p-5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none shadow-inner"
            required
            placeholder="Conte sua história e o que você oferece..."
            value={formData.description} 
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <MessageCircle size={14} className="text-green-500" /> WhatsApp
            </label>
            <Input 
              placeholder="(00) 00000-0000" 
              value={formData.whatsapp} 
              onChange={(e) => setFormData({ ...formData, whatsapp: maskPhone(e.target.value) })}
              className="h-12 rounded-xl font-mono border-border bg-muted/30 focus:bg-background transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <Instagram size={14} className="text-pink-500" /> Instagram
            </label>
            <Input 
              placeholder="@seu.negocio" 
              value={formData.instagram} 
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })} 
              className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <Music2 size={14} className="text-foreground" /> TikTok
            </label>
            <Input 
              placeholder="@seu.tiktok" 
              value={formData.tiktok} 
              onChange={(e) => setFormData({ ...formData, tiktok: e.target.value })} 
              className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 ml-1">
              <Globe size={14} className="text-primary" /> Site Oficial
            </label>
            <Input 
              placeholder="https://..." 
              value={formData.site} 
              onChange={(e) => setFormData({ ...formData, site: e.target.value })} 
              className="h-12 rounded-xl border-border bg-muted/30 focus:bg-background transition-all" 
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex flex-col gap-4 border-t border-border">
        <div className="flex gap-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={() => router.back()} 
            className="flex-1 h-14 rounded-2xl font-bold text-muted-foreground hover:bg-muted"
            disabled={loading || isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={loading || uploading || isDeleting} 
            className="flex-[2] h-14 rounded-2xl font-black text-lg shadow-lg shadow-primary/20 active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 size={20} className="mr-2" />}
            {loading ? "Salvando..." : "Confirmar Alterações"}
          </Button>
        </div>

        <Button 
          type="button" 
          onClick={handleDelete}
          disabled={loading || isDeleting}
          variant="outline"
          className="h-14 rounded-2xl border-destructive/20 text-destructive hover:bg-destructive/10 hover:border-destructive/40 font-bold transition-all flex items-center justify-center gap-2"
        >
          {isDeleting ? <Loader2 className="animate-spin" /> : <Trash2 size={18} />}
          {isDeleting ? "Excluindo..." : "Excluir cadastro permanentemente"}
        </Button>
      </div>
    </form>
  );
}