"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateServiceAction } from "@/app/provider/actions";

export default function EditServiceForm({ service }: { service: any }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Inicializamos o estado tratando campos null do banco para strings vazias
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const result = await updateServiceAction(service.id, formData);
      
      if (result.success) {
        // Redireciona para o Dashboard e limpa o cache da rota
        router.push("/admin/dashboard");
        router.refresh();
      } else {
        setError("Erro ao salvar as alterações.");
      }
    } catch (err) {
      setError("Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Informações Básicas</h3>
        
        <div className="grid gap-4">
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

          <div>
            <label className="text-sm font-medium">URL da Imagem/Logo</label>
            <Input 
              value={formData.image} 
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              placeholder="https://exemplo.com/foto.jpg"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Descrição Detalhada</label>
            <textarea 
              className="w-full min-h-[100px] rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Conte mais sobre o serviço..."
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">Contatos e Redes Sociais</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">WhatsApp</label>
            <Input 
              value={formData.whatsapp} 
              onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
              placeholder="Ex: 11999999999"
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
          disabled={loading} 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
        >
          {loading ? "Salvando..." : "Confirmar Alterações"}
        </Button>
      </div>
    </form>
  );
}