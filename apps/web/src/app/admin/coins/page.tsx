import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { MarketTable } from "@/components/dashboard/MarketTable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminCoinsPage() {
  return (
    <AppShell admin title="Asset Management" subtitle="List, edit, and configure exchange assets.">
      <div className="mb-5 grid gap-4 md:grid-cols-3">
        {["Listed Assets 214", "Active Pairs 642", "Network Fees $42.8K"].map((item) => <Card key={item} className="p-5"><p className="text-sm text-zinc-400">{item.replace(/ [^ ]+$/, "")}</p><h2 className="mt-2 text-3xl font-bold">{item.split(" ").at(-1)}</h2></Card>)}
      </div>
      <div className="mb-5 flex justify-end"><Button><Plus className="size-4" /> Add Asset</Button></div>
      <MarketTable />
    </AppShell>
  );
}
