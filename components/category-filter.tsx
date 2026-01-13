"use client";
import * as React from "react";

interface CategoryData {
  name: string;
  count: number;
}

interface CategoryFilterProps {
  categories: CategoryData[];
  activeCategory: string;
  onSelect: (categoryName: string) => void;
}

export default function CategoryFilter({ categories, activeCategory, onSelect }: CategoryFilterProps) {
  return (
    /* py-1 para manter a barra compacta e responsiva */
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 transition-colors">
      {categories.map((c) => {
        const isActive = activeCategory === c.name;
        
        return (
          <button
            key={c.name}
            onClick={() => onSelect(c.name)}
            /* Logística de Classes:
               - bg-white -> bg-card
               - border-slate-100 -> border-border
               - text-slate-400 -> text-muted-foreground
            */
            className={`
              whitespace-nowrap rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border active:scale-95
              ${isActive
                ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                : "bg-card text-muted-foreground border-border hover:border-primary/30 hover:text-primary"
              }
            `}
          >
            <span>{c.name}</span>
            
            {/* Badge do Contador: Adaptativo ao estado e ao tema */}
            <span className={`px-1 py-0.5 rounded text-[8px] font-black transition-colors ${
              isActive 
                ? "bg-primary-foreground/20 text-primary-foreground" 
                : "bg-muted text-muted-foreground group-hover:bg-primary/10"
            }`}>
              {c.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}