"use client";
import { createContext, useContext, useState } from "react";

type FreeCreditModalContextValue = {
  isFreeCreditOpen: boolean;
  openFreeCredit: () => void;
  closeFreeCredit: () => void;
};

const FreeCreditModalContext = createContext<FreeCreditModalContextValue | null>(null);

export function FreeCreditModalProvider({ children }: { children: React.ReactNode }) {
  const [isFreeCreditOpen, setIsFreeCreditOpen] = useState(false);

  return (
    <FreeCreditModalContext.Provider
      value={{
        isFreeCreditOpen,
        openFreeCredit: () => setIsFreeCreditOpen(true),
        closeFreeCredit: () => setIsFreeCreditOpen(false),
      }}
    >
      {children}
    </FreeCreditModalContext.Provider>
  );
}

export function useFreeCreditModal() {
  const ctx = useContext(FreeCreditModalContext);
  if (!ctx) {
    throw new Error("useFreeCreditModal must be used within FreeCreditModalProvider");
  }
  return ctx;
}
