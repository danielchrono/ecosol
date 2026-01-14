"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "./ui/button";

export default function LoadMore({ currentPage }: { currentPage: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleLoadMore() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", (currentPage + 1).toString());
    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <Button 
      onClick={handleLoadMore}
      variant="outline"
      className="px-10 border-blue-600 text-blue-600 hover:bg-blue-50"
    >
      Carregar Mais Negócios
    </Button>
  );
}