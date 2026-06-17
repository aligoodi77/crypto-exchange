import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  return (
    <AppShell title="Profile" subtitle="Manage account details and security preferences.">
      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="p-6 text-center"><div className="mx-auto grid size-24 place-items-center rounded-full bg-gradient-to-br from-pink-300 to-violet-600 text-3xl font-bold">A</div><h2 className="mt-4 text-xl font-bold">Ali Goudarzi</h2><p className="text-zinc-400">Verified trader</p></Card>
        <Card className="p-6"><h2 className="mb-5 font-semibold">Account Information</h2><div className="grid gap-4 md:grid-cols-2"><Input defaultValue="Ali Goudarzi" /><Input defaultValue="ali@example.com" /><Input defaultValue="+98 912 000 0000" /><Input defaultValue="Tehran, Iran" /></div><Button className="mt-6">Save Changes</Button></Card>
      </div>
    </AppShell>
  );
}
