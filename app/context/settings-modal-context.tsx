"use client";
import { createContext, useContext, useState } from "react";

type SettingsModalContextValue = {
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
};

const SettingsModalContext = createContext<SettingsModalContextValue | null>(null);

export function SettingsModalProvider({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <SettingsModalContext.Provider
      value={{
        isSettingsOpen,
        openSettings: () => setIsSettingsOpen(true),
        closeSettings: () => setIsSettingsOpen(false),
      }}
    >
      {children}
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  const ctx = useContext(SettingsModalContext);
  if (!ctx) {
    throw new Error("useSettingsModal must be used within SettingsModalProvider");
  }
  return ctx;
}
