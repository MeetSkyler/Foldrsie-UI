import type { Metadata } from "next";
import { inter } from "./fonts";
import "./globals.css";
import Appshell from "./components/Appshell";
import { AuthModalProvider } from "./context/auth-modal-context";
import { LoginModal } from "./ui/login-modal";
import { FreeCreditModalProvider } from "./context/free-credit-modal-context";
import FreeCreditModal from "./components/freeCreditModal";
import { OptionSelectionProvider } from "./context/option-selection-context";
import { GenerationsProvider } from "./context/generations-context";

export const metadata: Metadata = {
  title: "Foldrise",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <AuthModalProvider>
          <FreeCreditModalProvider>
            <OptionSelectionProvider>
              <GenerationsProvider>
                <Appshell>{children}</Appshell>
                <LoginModal />
                <FreeCreditModal />
              </GenerationsProvider>
            </OptionSelectionProvider>
          </FreeCreditModalProvider>
        </AuthModalProvider>
      </body>
    </html>
  );
}
