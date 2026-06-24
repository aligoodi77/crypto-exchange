import { RequireAuth } from "@/components/auth/RequireAuth";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <RequireAuth requiredRole="ADMIN">{children}</RequireAuth>;
}
