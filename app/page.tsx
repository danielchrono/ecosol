import prisma from "@/lib/prisma";
import Header from "@/components/header";
import ServiceCard from "@/components/service-card";
import SearchBar from "@/components/search-bar";
import CategoryFilter from "@/components/category-filter";
import LoadMore from "@/components/load-more";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { q, category, page } = await searchParams;

  // Inicialização de variáveis com tipos explícitos (Visão de Engenharia)
  let categoryCounts: any[] = [];
  let totalServicesCount = 0;
  let services: any[] = [];
  let totalFilteredCount = 0;

  const ITEMS_PER_PAGE = 6;
  const currentPage = Number(page) || 1;

  // 1. Bloco de Busca com Tratamento de Erro Explícito
  try {
    // Buscas em paralelo para otimização de performance
    const [counts, total] = await Promise.all([
      prisma.service.groupBy({
        by: ['category'],
        where: { approved: true, suspended: false },
        _count: { category: true },
        orderBy: { category: 'asc' }
      }),
      prisma.service.count({
        where: { approved: true, suspended: false }
      })
    ]);
    categoryCounts = counts;
    totalServicesCount = total;
  } catch (err) {
    console.error("Erro na busca de categorias:", err);
  }

  // 2. Construção segura da lista de categorias
  const categoriesWithCounts = [
    { name: "Todas", count: totalServicesCount },
    ...(categoryCounts.map(c => ({
      name: c.category,
      count: c._count.category
    })))
  ];

  // Configuração do filtro 'where'
  const where = {
    approved: true,
    suspended: false,
    ...(category && category !== "Todas" ? { category: category } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { category: { contains: q, mode: 'insensitive' as const } },
        { description: { contains: q, mode: 'insensitive' as const } },
      ],
    } : {}),
  };

  try {
    const [foundServices, filteredTotal] = await Promise.all([
      prisma.service.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: ITEMS_PER_PAGE * currentPage,
      }),
      prisma.service.count({ where }),
    ]);
    services = foundServices;
    totalFilteredCount = filteredTotal;
  } catch (err) {
    console.error("Erro na busca de serviços:", err);
  }

  const hasMore = services.length < totalFilteredCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main className="mx-auto max-w-6xl p-6">
        <section className="flex flex-col items-center text-center py-10 gap-4">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Economia Solidária <span className="text-blue-600">Entre Autistas</span>
          </h1>
          <SearchBar />
        </section>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Categorias</h2>
          <CategoryFilter categories={categoriesWithCounts} />
        </div>

        {services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 mt-8">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="text-slate-500 font-medium italic">
              Nenhum serviço disponível no momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8 animate-in fade-in duration-500">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-12 pb-10">
            <LoadMore currentPage={currentPage} />
          </div>
        )}
      </main>
    </div>
  );
}