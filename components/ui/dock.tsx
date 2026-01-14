"use client";

import React from 'react';
import { cn } from "@/lib/utils";

interface DockProps {
  children: React.ReactNode;
  className?: string;
}

export default function Dock({ children, className }: DockProps) {
  return (
    <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none px-4">
      <nav className={cn(className)}>
        {children}
      </nav>
    </div>
  );
}