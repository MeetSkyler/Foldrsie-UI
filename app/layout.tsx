import type { Metadata } from "next";
import { inter } from "./fonts";
import "./globals.css";
import Appshell from "./components/Appshell";
import { AuthModalProvider } from "./context/auth-modal-context";
import { LoginModal } from "./ui/login-modal";

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
          <Appshell>{children}</Appshell>
          <LoginModal />
        </AuthModalProvider>
      </body>
    </html>
  );
}
