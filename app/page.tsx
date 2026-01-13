import prisma from "@/lib/prisma";
import Header from "@/components/header";
import LiveSearchContainer from "@/components/live-search-container";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;

  const [counts, total, initialServices] = await Promise.all([
    prisma.service.groupBy({
      by: ['category'],
      where: { approved: true, suspended: false, deletedAt: null },
      _count: { category: true },
      orderBy: { category: 'asc' }
    }),
    prisma.service.count({
      where: { approved: true, suspended: false, deletedAt: null }
    }),
    prisma.service.findMany({
      where: {
        approved: true,
        suspended: false,
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      take: 12, 
    })
  ]);

  const categoriesWithCounts = [
    { name: "Todas", count: total },
    ...counts.map(c => ({ name: c.category, count: c._count.category }))
  ];

  return (
    /* LOGÍSTICA VISUAL: 
       - bg-slate-50 -> bg-background (Branco no Light / Slate-950 no Dark)
       - text-slate-900 -> text-foreground (Preto no Light / Branco no Dark)
    */
    <div className="min-h-screen bg-background text-foreground pb-10 transition-colors duration-300">
      <Header />
      
      <main className="mx-auto max-w-6xl px-6 py-4">
        <LiveSearchContainer 
          initialServices={initialServices} 
          categories={categoriesWithCounts} 
        />
      </main>
    </div>
  );
}