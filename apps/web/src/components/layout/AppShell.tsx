import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children, title, subtitle, admin = false }: { children: React.ReactNode; title: string; subtitle?: string; admin?: boolean }) {
  return (
    <div className="coin-surface min-h-screen pb-24 md:pb-0">
      <Sidebar admin={admin} />
      <main className="px-4 py-6 md:ml-[104px] md:px-8">
        <Header title={title} subtitle={subtitle} />
        {children}
      </main>
      <MobileNav />
    </div>
  );
}
