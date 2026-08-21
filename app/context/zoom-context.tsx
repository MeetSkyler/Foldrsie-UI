"use client";
import { createContext, useContext, useState } from "react";

type ZoomContextValue = {
  // Shared across every option-picker page (Face, Top, Pose, Aspect ratio,
  // etc.) so the zoom/density the user picks on one page carries over to
  // the next instead of resetting back to the default each time they
  // navigate. Each page's own COLUMN_STOPS array (small vs large screen)
  // interprets this same 0-100 value at its own step granularity.
  zoom: number;
  setZoom: (zoom: number) => void;
};

const ZoomContext = createContext<ZoomContextValue | null>(null);

export function ZoomProvider({ children }: { children: React.ReactNode }) {
  const [zoom, setZoom] = useState(50);

  return (
    <ZoomContext.Provider value={{ zoom, setZoom }}>
      {children}
    </ZoomContext.Provider>
  );
}

export function useZoom() {
  const ctx = useContext(ZoomContext);
  if (!ctx) {
    throw new Error("useZoom must be used within ZoomProvider");
  }
  return ctx;
}
