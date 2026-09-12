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
  // Desktop's Face/Top/Bottom/etc. pickers each live on their own route
  // (app/faceModal, app/topModal, ...), so keeping the item list (catalog +
  // user uploads/custom colors) in that page's own local state meant it
  // reset back to the static catalog every time the user navigated away and
  // returned — any uploaded photo or created color silently vanished.
  // Persisting it here instead, one level up in a provider that outlives
  // every route change, fixes that (mirrors mobile's MobileGenerateFlow,
  // which keeps the same list alive in its own parent for the same reason).
  itemsByKey: Record<string, unknown[]>;
  setItemsForKey: (key: string, items: unknown[]) => void;
};

const OptionSelectionContext = createContext<OptionSelectionContextValue | null>(null);

export function OptionSelectionProvider({ children }: { children: React.ReactNode }) {
  const [selections, setSelections] = useState<Record<string, SelectedOptionImage | null>>({});
  const [itemsByKey, setItemsByKeyState] = useState<Record<string, unknown[]>>({});

  function setSelection(key: string, value: SelectedOptionImage | null) {
    setSelections((prev) => ({ ...prev, [key]: value }));
  }

  function setItemsForKey(key: string, items: unknown[]) {
    setItemsByKeyState((prev) => ({ ...prev, [key]: items }));
  }

  return (
    <OptionSelectionContext.Provider value={{ selections, setSelection, itemsByKey, setItemsForKey }}>
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
