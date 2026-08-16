"use client";
import { createContext, useContext, useState } from "react";
import type { StaticImageData } from "next/image";

export type SelectedOptionImage = {
  id: string;
  // Exactly one of these is set: a photo, a solid color (e.g. a custom
  // background color), or a width/height ratio (e.g. aspect ratio) — none
  // of which have an image to show in the icon box.
  image?: StaticImageData | string;
  color?: string;
  ratio?: number;
  ratioLabel?: string;
};

type OptionSelectionContextValue = {
  // null means "explicitly cleared / default option chosen" — the icon box
  // should fall back to its default icon rather than showing an image.
  selections: Record<string, SelectedOptionImage | null>;
  setSelection: (key: string, value: SelectedOptionImage | null) => void;
};

const OptionSelectionContext = createContext<OptionSelectionContextValue | null>(null);

export function OptionSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selections, setSelections] = useState<Record<string, SelectedOptionImage | null>>({});

  function setSelection(key: string, value: SelectedOptionImage | null) {
    setSelections((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <OptionSelectionContext.Provider value={{ selections, setSelection }}>
      {children}
    </OptionSelectionContext.Provider>
  );
}

export function useOptionSelection() {
  const ctx = useContext(OptionSelectionContext);
  if (!ctx) {
    throw new Error("useOptionSelection must be used within OptionSelectionProvider");
  }
  return ctx;
}
