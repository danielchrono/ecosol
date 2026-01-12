"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateServiceAction } from "@/app/provider/actions";

export default function EditServiceForm({ service }: { service: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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

  // Função para gerenciar o upload da imagem para o Supabase Storage
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      setError("");
      
      if (!e.target.files || e.target.files.length === 0) return;

      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${service.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // 1. Upload para o bucket 'logos'
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Captura a URL pública gerada
      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      // 3. Atualiza o estado local para o preview e posterior salvamento
      setFormData({ ...formData, image: publicUrl });
      
    } catch (err: any) {
      setError("Erro ao fazer upload da imagem: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await updateServiceAction(service.id, formData);
      
      if (result.success) {
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError("Erro ao salvar as alterações no banco de dados.");
      }
    } catch (err) {
      setError("Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Seção de Imagem / Logotipo */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Identidade Visual</h3>
        <div className="flex flex-col md:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <div className="relative w-32 h-32 bg-white rounded-lg overflow-hidden border shadow-sm flex items-center justify-center">
            {formData.image ? (
              <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl text-slate-300">🏢</span>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">Alterar Foto do Perfil</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading || loading}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 cursor-pointer"
            />
            <p className="text-xs text-slate-500 italic">Formatos aceitos: JPG, PNG ou WebP.</p>
          </div>
        </div>
        
        <div>
          <label className="text-sm font-medium">URL Manual da Imagem (Opcional)</label>
          <Input 
            value={formData.image} 
            onChange={(e) => setFormData({...formData, image: e.target.value})}
            placeholder="https://exemplo.com/sua-logo.png"
            className="mt-1"
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nome do Negócio</label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Input 
                value={formData.category} 
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                required 
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descrição Detalhada</label>
            <textarea 
              className="w-full min-h-[120px] rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Descreva o que este negócio faz, diferenciais, etc..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Contatos e Redes Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">WhatsApp (apenas números)</label>
            <Input 
              value={formData.whatsapp} 
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              placeholder="31999999999"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Instagram</label>
            <Input 
              value={formData.instagram} 
              onChange={(e) => setFormData({...formData, instagram: e.target.value})}
              placeholder="@seu.perfil"
            />
          </div>
          <div>
            <label className="text-sm font-medium">TikTok</label>
            <Input 
              value={formData.tiktok} 
              onChange={(e) => setFormData({...formData, tiktok: e.target.value})}
              placeholder="@seu.tiktok"
            />
          </div>
          <div>
            <label className="text-sm font-medium">E-mail</label>
            <Input 
              type="email"
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Site Oficial</label>
            <Input 
              value={formData.site} 
              onChange={(e) => setFormData({...formData, site: e.target.value})}
              placeholder="https://seusite.com.br"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 flex gap-3 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()} 
          className="flex-1"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={loading || uploading} 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold"
        >
          {loading ? "Salvando Alterações..." : "Confirmar Alterações"}
        </Button>
      </div>
    </form>
  );
}