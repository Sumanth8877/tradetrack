export default function WorkspaceLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-8 w-28 rounded-full border border-white/10 bg-white/8" />
        <div className="h-16 max-w-4xl rounded-[28px] border border-white/8 bg-white/6" />
        <div className="h-6 max-w-2xl rounded-full bg-white/6" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="min-h-[188px] rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,39,0.95),rgba(7,10,19,0.96))] p-5"
          >
            <div className="h-3 w-24 rounded-full bg-white/8" />
            <div className="mt-6 h-10 w-28 rounded-full bg-white/8" />
            <div className="mt-5 h-5 w-40 rounded-full bg-white/6" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,39,0.95),rgba(7,10,19,0.96))] p-5">
          <div className="h-7 w-48 rounded-full bg-white/8" />
          <div className="mt-3 h-5 w-80 rounded-full bg-white/6" />
          <div className="mt-8 space-y-4">
            {Array.from({ length: 3 }, (_, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-white/8 bg-black/18 p-4"
              >
                <div className="h-4 w-48 rounded-full bg-white/8" />
                <div className="mt-4 h-5 w-64 rounded-full bg-white/10" />
                <div className="mt-3 h-4 w-full rounded-full bg-white/6" />
                <div className="mt-2 h-4 w-5/6 rounded-full bg-white/6" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              key={index}
              className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,20,39,0.95),rgba(7,10,19,0.96))] p-5"
            >
              <div className="h-7 w-44 rounded-full bg-white/8" />
              <div className="mt-3 h-5 w-64 rounded-full bg-white/6" />
              <div className="mt-6 h-40 rounded-[24px] bg-white/6" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
