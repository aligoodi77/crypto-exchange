import type { Metadata } from "next";

import "./globals.css";

import { AuthSessionHydrator } from "@/components/layout/AuthSessionHydrator";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "CoinBarrier Exchange",
  description: "Crypto exchange dashboard UI mock",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          <AuthSessionHydrator />
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
