import type { Metadata } from "next";
import "./globals.css";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { AuthSessionHydrator } from "@/components/layout/AuthSessionHydrator";

export const metadata: Metadata = {
  title: "CoinBarrier Exchange",
  description: "Crypto exchange dashboard UI mock",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthSessionHydrator />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
