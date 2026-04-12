export function InsightLines({ body }: { body: string }) {
  const lines = body
    .split("\n")
    .map((line) => line.replace(/^[-*]\s*/, "").trim())
    .filter(Boolean);

  return (
    <div className="space-y-3">
      {lines.map((line) => (
        <div
          key={line}
          className="rounded-2xl border border-white/8 bg-black/25 px-4 py-3 text-sm leading-7 text-zinc-200"
        >
          {line}
        </div>
      ))}
    </div>
  );
}
