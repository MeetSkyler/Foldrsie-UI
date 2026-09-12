"use client";
import { createContext, useContext, useState } from "react";

export type SettingsTab = "account" | "billing" | "usage";

type SettingsModalContextValue = {
  isSettingsOpen: boolean;
  activeTab: SettingsTab;
  setActiveTab: (tab: SettingsTab) => void;
  // `tab` lets callers (e.g. the navbar profile dropdown) jump straight to a
  // specific tab instead of always landing on "My account".
  openSettings: (tab?: SettingsTab) => void;
  closeSettings: () => void;
};

const SettingsModalContext = createContext<SettingsModalContextValue | null>(null);

export function SettingsModalProvider({ children }: { children: React.ReactNode }) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");

  return (
    <SettingsModalContext.Provider
      value={{
        isSettingsOpen,
        activeTab,
        setActiveTab,
        openSettings: (tab) => {
          if (tab) setActiveTab(tab);
          setIsSettingsOpen(true);
        },
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
