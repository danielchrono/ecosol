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

  // 1. BUSCA OTIMIZADA (Engenharia de Performance: Buscas paralelas)
  const [categoryCounts, totalServicesCount] = await Promise.all([
    prisma.service.groupBy({
      by: ['category'],
      where: { approved: true, suspended: false },
      _count: { category: true },
      orderBy: { category: 'asc' }
    }),
    prisma.service.count({
      where: { approved: true, suspended: false }
    })
  ]).catch(() => [[], 0]); // Blindagem: se a conexão falhar, retorna dados vazios em vez de travar

  // 2. CONSTRÓI O OBJETO COM FALLBACKS (Garante exibição mesmo sem cadastros)
  const categoriesWithCounts = [
    { name: "Todas", count: totalServicesCount || 0 },
    ...(categoryCounts?.map(c => ({
      name: c.category,
      count: c._count.category
    })) || [])
  ];

  const ITEMS_PER_PAGE = 6;
  const currentPage = Number(page) || 1;

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

  const [services, totalFilteredCount] = await Promise.all([
    prisma.service.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE * currentPage,
    }),
    prisma.service.count({ where }),
  ]).catch(() => [[], 0]);

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
          {/* Componente agora recebe dados mesmo que vazios */}
          <CategoryFilter categories={categoriesWithCounts} />
        </div>

        {services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200 mt-8">
            <span className="text-4xl block mb-2">🔍</span>
            <p className="text-slate-500 font-medium italic">Nenhum serviço disponível no momento.</p>
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