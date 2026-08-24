"use client";
import { createContext, useContext, useState } from "react";

type PricingModalContextValue = {
  isPricingOpen: boolean;
  openPricing: () => void;
  closePricing: () => void;
};

const PricingModalContext = createContext<PricingModalContextValue | null>(null);

export function PricingModalProvider({ children }: { children: React.ReactNode }) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  return (
    <PricingModalContext.Provider
      value={{
        isPricingOpen,
        openPricing: () => setIsPricingOpen(true),
        closePricing: () => setIsPricingOpen(false),
      }}
    >
      {children}
    </PricingModalContext.Provider>
  );
}

export function usePricingModal() {
  const ctx = useContext(PricingModalContext);
  if (!ctx) {
    throw new Error("usePricingModal must be used within PricingModalProvider");
  }
  return ctx;
}
