import type { ReactNode } from "react";

import { panelClass } from "@/lib/styles";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

export function SectionCard({
  actions,
  children,
  className,
  description,
  title,
}: SectionCardProps) {
  return (
    <section className={cn(panelClass, className)}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-50">{title}</h2>
          {description ? (
            <p className="mt-1 max-w-2xl text-sm leading-6 text-zinc-400">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
