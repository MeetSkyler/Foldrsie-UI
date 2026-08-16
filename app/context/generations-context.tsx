"use client";
import { createContext, useContext, useState } from "react";

export type GenerationItem = {
  id: string;
  image: string;
  ratio: number;
};

type GenerationsContextValue = {
  generations: GenerationItem[];
  addGeneration: (item: GenerationItem) => void;
};

const GenerationsContext = createContext<GenerationsContextValue | null>(null);

export function GenerationsProvider({ children }: { children: React.ReactNode }) {
  const [generations, setGenerations] = useState<GenerationItem[]>([]);

  function addGeneration(item: GenerationItem) {
    setGenerations((prev) => [...prev, item]);
  }

  return (
    <GenerationsContext.Provider value={{ generations, addGeneration }}>
      {children}
    </GenerationsContext.Provider>
  );
}

export function useGenerations() {
  const ctx = useContext(GenerationsContext);
  if (!ctx) {
    throw new Error("useGenerations must be used within GenerationsProvider");
  }
  return ctx;
}
