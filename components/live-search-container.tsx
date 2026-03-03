"use client";

import * as React from "react";
import SearchBar from "./search-bar";
import ServiceCard from "./service-card";
import CategoryFilter from "./category-filter";
import ServiceSkeleton from "./service-skeleton";
import { Service } from "@prisma/client";

interface CategoryData {
  name: string;
  count: number;
}

export default function LiveSearchContainer({
  initialServices,
  categories,
}: {
  initialServices: Service[];
  categories: CategoryData[];
}) {
  const [services, setServices] = React.useState<Service[]>(initialServices);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Todas");
  const [isSearching, setIsSearching] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setIsSearching(true);
      try {
        const query = new URLSearchParams({
          q: searchTerm,
          category: selectedCategory,
        });
        const res = await fetch(`/api/search?${query.toString()}`);
        if (res.ok) setServices(await res.json());
      } catch (err) {
        console.error("Erro busca:", err);
      } finally {
        setIsSearching(false);
      }
    };
    const timeoutId = setTimeout(fetchData, searchTerm ? 400 : 0);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="w-full flex flex-col transition-colors duration-300">
      {/* 1. Hero: py-2 e gap-3 - Cores Adaptativas */}
      <section className="flex flex-col items-center py-2 gap-3">
        <div className="text-center space-y-0">
          <h1 className="text-2xl font-bold text-foreground tracking-tighter uppercase leading-none">
            Economia Solidária
            <p className="text-primary text-xl"> Entre Autistas</p>
          </h1>
        </div>
        <div className="w-full max-w-md">
          <SearchBar onSearch={setSearchTerm} />
        </div>
      </section>

      {/* 2. Filtros: border-slate-50 -> border-border */}
      <div className="py-1 border-b border-border mb-0">
        <CategoryFilter
          categories={categories}
          activeCategory={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      {/* 3. Grid: mt-1 - Logística de Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-1">
        {isSearching ? (
          Array.from({ length: 6 }).map((_, i) => <ServiceSkeleton key={i} />)
        ) : services.length === 0 ? (
          /* Empty State: bg-white -> bg-card | border-slate-100 -> border-border */
          <div className="col-span-full text-center py-16 bg-card rounded-[2.5rem] border border-dashed border-border animate-in fade-in zoom-in-95 duration-500">
            <div className="text-3xl mb-3 grayscale opacity-30">🔍</div>
            <p className="text-muted-foreground font-black text-[10px] uppercase tracking-[0.3em]">
              Nenhum resultado encontrado
            </p>
          </div>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <ServiceCard service={service} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
