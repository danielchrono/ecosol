"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  /* Retorna null conforme sua estratégia de UX (Oculto no Header) */
  return null;
}