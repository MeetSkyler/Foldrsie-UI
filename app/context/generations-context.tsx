"use client";
import { createContext, useContext, useRef, useState } from "react";
import dummyResult from "@/public/img4.jpg";

export type GenerationItem = {
  id: string;
  image: string;
  ratio: number;
};

export type GenerationToastStatus = "loading" | "done" | "error" | "offline";

export type GenerationToast = {
  id: string;
  ratio: number;
  status: GenerationToastStatus;
  image?: string;
  // Whether the user has already seen this result on the generate page
  // itself (either by being there when it finished, or visiting it
  // afterward) — once true, the floating toast stops showing for this
  // generation on other pages, since there's nothing new left to surface.
  viewed: boolean;
};

// Dummy stand-in for the real generation API — swap this out once a real
// request/response is wired up.
const GENERATE_DURATION_MS = 6000;

type GenerationsContextValue = {
  generations: GenerationItem[];
  addGeneration: (item: GenerationItem) => void;
  // Read by both the sidebar's own "Generate" button and the generate
  // page's loading card, so they show the same disabled/spinner state.
  isGenerating: boolean;
  // The generate page's root layout mounts its content twice at once (a
  // hidden desktop copy + a hidden-on-desktop mobile copy — see
  // Appshell.tsx), so two independent component instances can each try to
  // start a generation for the same click. Routing the actual timer/result
  // through this provider (which itself only ever mounts once) and
  // guarding it with `inFlightRef` makes a second, redundant call from the
  // other mounted instance a no-op instead of producing a duplicate result.
  startGeneration: (ratio: number) => void;
  // Drives the floating status card shown on every page except /generate
  // itself (which already has its own full-size loading/done card) — set
  // while a generation is in flight or its result hasn't been dismissed
  // yet, cleared entirely once the user dismisses it.
  activeToast: GenerationToast | null;
  dismissToast: () => void;
  markToastViewed: () => void;
};

const GenerationsContext = createContext<GenerationsContextValue | null>(null);

export function GenerationsProvider({ children }: { children: React.ReactNode }) {
  const [generations, setGenerations] = useState<GenerationItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeToast, setActiveToast] = useState<GenerationToast | null>(null);
  const inFlightRef = useRef(false);

  function addGeneration(item: GenerationItem) {
    setGenerations((prev) => [...prev, item]);
  }

  function startGeneration(ratio: number) {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    const id = `gen-${Date.now()}`;
    setIsGenerating(true);
    setActiveToast({ id, ratio, status: "loading", viewed: false });
    setTimeout(() => {
      const item: GenerationItem = { id, image: dummyResult.src, ratio };
      addGeneration(item);
      setIsGenerating(false);
      setActiveToast({ id, ratio, status: "done", image: item.image, viewed: false });
      inFlightRef.current = false;
    }, GENERATE_DURATION_MS);
  }

  function dismissToast() {
    setActiveToast(null);
  }

  function markToastViewed() {
    setActiveToast((prev) => (prev ? { ...prev, viewed: true } : prev));
  }

  return (
    <GenerationsContext.Provider
      value={{ generations, addGeneration, isGenerating, startGeneration, activeToast, dismissToast, markToastViewed }}
    >
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
