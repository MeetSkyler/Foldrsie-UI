import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "Foldrise",
  description: "",
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
                    <Appshell initialSidebarCollapsed={initialSidebarCollapsed}>{children}</Appshell>
                    <LoginModal />
                    <FreeCreditModal />
                    <FeedbackModal />
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
