import { getFlashMessage } from "@/lib/flash";
import { cn } from "@/lib/utils";

const toneClasses = {
  error: "border-rose-400/30 bg-rose-500/10 text-rose-100",
  info: "border-cyan-300/30 bg-cyan-400/10 text-cyan-50",
  success: "border-emerald-400/30 bg-emerald-500/10 text-emerald-50",
};

export function FlashBanner({ code }: { code?: string | null }) {
  const flash = getFlashMessage(code);

  if (!flash) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-3xl border px-5 py-4 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.9)]",
        toneClasses[flash.tone],
      )}
    >
      <p className="text-sm font-semibold">{flash.title}</p>
      <p className="mt-1 text-sm leading-6 opacity-85">{flash.message}</p>
    </div>
  );
}
