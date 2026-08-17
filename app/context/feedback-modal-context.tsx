"use client";
import { createContext, useContext, useState } from "react";

type FeedbackModalContextValue = {
  isFeedbackOpen: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
};

const FeedbackModalContext = createContext<FeedbackModalContextValue | null>(null);

export function FeedbackModalProvider({ children }: { children: React.ReactNode }) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <FeedbackModalContext.Provider
      value={{
        isFeedbackOpen,
        openFeedback: () => setIsFeedbackOpen(true),
        closeFeedback: () => setIsFeedbackOpen(false),
      }}
    >
      {children}
    </FeedbackModalContext.Provider>
  );
}

export function useFeedbackModal() {
  const ctx = useContext(FeedbackModalContext);
  if (!ctx) {
    throw new Error("useFeedbackModal must be used within FeedbackModalProvider");
  }
  return ctx;
}
