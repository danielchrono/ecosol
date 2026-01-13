/**
 * OPERAÇÃO LIMPEZA: Normaliza todas as categorias existentes no banco.
 * Transforma " Teste", "TESTE" e "Teste" em "teste".
 */
export async function migrateCategoriesToLowerCase() {
  const auth = await getAuthContext();
  if (!auth.isAdmin) throw new Error("Ação restrita ao administrador");

  try {
    // 1. Busca todos os serviços que possuem categoria
    const services = await prisma.service.findMany({
      select: { id: true, category: true }
    });

    console.log(`📦 Iniciando normalização de ${services.length} registros...`);

    // 2. Mapeia e executa as atualizações
    const updates = services.map((s) => {
      const normalized = s.category ? s.category.trim().toLowerCase() : "";
      
      return prisma.service.update({
        where: { id: s.id },
        data: { category: normalized }
      });
    });

    // 3. Executa em transação para garantir integridade
    await prisma.$transaction(updates);

    console.log("✅ Logística concluída: Todas as categorias foram normalizadas!");
    revalidatePath("/");
    return { success: true, message: `${services.length} categorias padronizadas.` };
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    return { success: false, error: "Falha na normalização dos dados." };
  }
}