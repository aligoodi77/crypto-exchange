import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkline } from "@/components/dashboard/Sparkline";

export function BalanceCard() {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-sm text-zinc-300">
        Total Wallet Balance <Eye className="size-4" />
      </div>
      <div className="mt-4 text-4xl font-bold">$54,380.42</div>
      <div className="mt-2 text-sm font-semibold text-emerald-400">+3.28% (24h)</div>
      <Sparkline />
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button>Deposit</Button>
        <Button variant="secondary">Withdraw</Button>
      </div>
    </Card>
  );
}
