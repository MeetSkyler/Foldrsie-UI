import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { inter } from "./fonts";
import "./globals.css";
import Appshell from "./components/Appshell";
import { AuthModalProvider } from "./context/auth-modal-context";
import { LoginModal } from "./ui/login-modal";
import { FreeCreditModalProvider } from "./context/free-credit-modal-context";
import FreeCreditModal from "./components/freeCreditModal";
import { OptionSelectionProvider } from "./context/option-selection-context";
import { GenerationsProvider } from "./context/generations-context";
import { ZoomProvider } from "./context/zoom-context";
import { FeedbackModalProvider } from "./context/feedback-modal-context";
import FeedbackModal from "./components/FeedbackModal";
import { PricingModalProvider } from "./context/pricing-modal-context";
import PricingModal from "./components/PricingModal";
import { SettingsModalProvider } from "./context/settings-modal-context";
import SettingsModal from "./components/SettingsModal";

export const metadata: Metadata = {
  title: "Foldrise",
  description: "",
};

// `viewport-fit=cover` is what makes `env(safe-area-inset-*)` report the
// device's real notch/home-indicator size instead of always resolving to
// 0px — without it, every `max(12px, env(safe-area-inset-bottom))` used
// across the mobile UI silently collapses to a flat 12px on every device,
// which isn't enough to clear the real gesture bar on notched phones.
export const viewport: Viewport = {
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read on the server so the very first HTML already has the sidebar at its
  // saved width — there's no wrong initial state for the client to correct,
  // so the collapse preference can't flicker on reload. Absent cookie (first
  // visit) means expanded.
  const cookieStore = await cookies();
  const initialSidebarCollapsed = cookieStore.get("sidebar-collapsed")?.value === "true";

  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthModalProvider>
          <FreeCreditModalProvider>
            <OptionSelectionProvider>
              <GenerationsProvider>
                <ZoomProvider>
                  <FeedbackModalProvider>
                    <PricingModalProvider>
                      <SettingsModalProvider>
                        <Appshell initialSidebarCollapsed={initialSidebarCollapsed}>{children}</Appshell>
                        <LoginModal />
                        <FreeCreditModal />
                        <FeedbackModal />
                        {/* SettingsModal before PricingModal — both are
                            z-50 fixed overlays, so DOM order decides which
                            wins when they're open at the same time (View
                            plans, inside Settings' Billing tab, opens
                            Pricing on top of it). Later in the DOM = on
                            top for equal z-index. */}
                        <SettingsModal />
                        <PricingModal />
                      </SettingsModalProvider>
                    </PricingModalProvider>
                  </FeedbackModalProvider>
                </ZoomProvider>
              </GenerationsProvider>
            </OptionSelectionProvider>
          </FreeCreditModalProvider>
        </AuthModalProvider>
      </body>
    </html>
  );
}
