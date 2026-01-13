"use client";
import * as React from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  onSearch: (term: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [q, setQ] = React.useState("");

  React.useEffect(() => {
    onSearch(q);
  }, [q, onSearch]);

  return (
    /**
     * CONTÊINER PAI (Logística de Cores Adaptativas)
     * - bg-white -> bg-background
     * - border-slate-200 -> border-input
     * - focus-within:ring-blue-50/50 -> focus-within:ring-primary/20
     */
    <div className="flex w-full max-w-2xl items-center bg-background h-11 px-4 
                    rounded-full border border-input transition-all duration-300
                    focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/20 
                    shadow-sm group">
      
      {/* Lupa integrada: text-slate-400 -> text-muted-foreground */}
      <Search className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors stroke-[2.5px] shrink-0" />

      {/* INPUT NATIVO:
          - text-slate-700 -> text-foreground
          - placeholder:text-slate-300 -> placeholder:text-muted-foreground
      */}
      <input
        type="text"
        className="flex-1 bg-transparent h-full ml-3 text-sm font-bold text-foreground 
                   placeholder:text-muted-foreground/60 placeholder:font-medium
                   outline-none border-none ring-0 focus:ring-0 focus:outline-none"
        placeholder="O que você precisa hoje?"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
    </div>
  );
}