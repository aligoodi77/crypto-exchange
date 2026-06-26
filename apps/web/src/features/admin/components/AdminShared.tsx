import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AdminStateCard({
  title,
  message,
  onRetry,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="space-y-4 rounded-xl border border-white/10 bg-white/3 p-6 text-center">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <p className="text-sm text-zinc-400">{message}</p>
      {onRetry ? <Button onClick={onRetry}>Try Again</Button> : null}
    </div>
  );
}

export function AdminTableSkeleton({ columns }: { columns: number }) {
  return Array.from({ length: 8 }).map((_, rowIndex) => (
    <tr className="border-b border-white/5" key={rowIndex}>
      {Array.from({ length: columns }).map((__, cellIndex) => (
        <td className="px-5 py-5" key={cellIndex}>
          <div className="h-4 animate-pulse rounded bg-white/10" />
        </td>
      ))}
    </tr>
  ));
}

export function StatusBadge({ status }: { status: string }) {
  const className =
    status === "SUCCESS" || status === "ACTIVE" || status === "VERIFIED"
      ? "bg-emerald-500/15 text-emerald-300"
      : status === "FAILED" || status === "INACTIVE"
        ? "bg-red-500/15 text-red-300"
        : "bg-amber-500/15 text-amber-300";

  return <Badge className={className}>{status}</Badge>;
}
