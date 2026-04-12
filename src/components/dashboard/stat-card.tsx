import { type LucideIcon } from "lucide-react";

import { panelClass } from "@/lib/styles";

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className={panelClass}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold text-zinc-50">{value}</p>
        </div>
        <span className="rounded-2xl border border-white/10 bg-white/8 p-3 text-cyan-200">
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}
