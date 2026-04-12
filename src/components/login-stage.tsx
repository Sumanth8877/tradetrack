"use client";

import type { CSSProperties, ReactNode } from "react";
import { useRef } from "react";

const candleHeights = [74, 38, 92, 51, 84, 45, 68, 58, 96, 42, 77, 63];
const marketColumns = [36, 58, 44, 82, 60, 104, 74, 126, 88, 112, 69, 132, 95];
const tracePath =
  "M0 128 C 56 118, 94 92, 134 98 S 220 152, 278 126 S 388 58, 460 84 S 560 156, 644 118 S 760 72, 860 90";

const beacons = [
  { left: "14%", top: "18%", size: 10, delay: "0ms" },
  { left: "22%", top: "72%", size: 8, delay: "380ms" },
  { left: "74%", top: "16%", size: 9, delay: "780ms" },
  { left: "80%", top: "70%", size: 11, delay: "1120ms" },
  { left: "56%", top: "12%", size: 7, delay: "1480ms" },
  { left: "62%", top: "82%", size: 9, delay: "820ms" },
];

type LoginStageProps = {
  children: ReactNode;
};

export function LoginStage({ children }: LoginStageProps) {
  const sceneRef = useRef<HTMLDivElement>(null);

  function updatePointer(clientX: number, clientY: number) {
    const scene = sceneRef.current;

    if (!scene) {
      return;
    }

    const rect = scene.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    const tiltX = ((50 - y) / 50) * 7;
    const tiltY = ((x - 50) / 50) * 10;

    scene.style.setProperty("--login-pointer-x", `${x}%`);
    scene.style.setProperty("--login-pointer-y", `${y}%`);
    scene.style.setProperty("--login-tilt-x", `${tiltX}deg`);
    scene.style.setProperty("--login-tilt-y", `${tiltY}deg`);
  }

  function resetPointer() {
    const scene = sceneRef.current;

    if (!scene) {
      return;
    }

    scene.style.setProperty("--login-pointer-x", "50%");
    scene.style.setProperty("--login-pointer-y", "50%");
    scene.style.setProperty("--login-tilt-x", "0deg");
    scene.style.setProperty("--login-tilt-y", "0deg");
  }

  return (
    <main
      className="relative isolate grid min-h-screen place-items-center overflow-hidden bg-[#020711] px-5 py-8 text-zinc-50"
      onMouseLeave={resetPointer}
      onMouseMove={(event) => updatePointer(event.clientX, event.clientY)}
      ref={sceneRef}
      style={
        {
          "--login-pointer-x": "50%",
          "--login-pointer-y": "50%",
          "--login-tilt-x": "0deg",
          "--login-tilt-y": "0deg",
        } as CSSProperties
      }
    >
      <div className="login-grid pointer-events-none absolute inset-0 opacity-80" />
      <div className="login-noise pointer-events-none absolute inset-0 opacity-40" />
      <div className="login-aurora pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(245,158,11,0.18),transparent_27%),radial-gradient(circle_at_50%_86%,rgba(16,185,129,0.14),transparent_34%)]" />
      <div className="login-spotlight pointer-events-none absolute inset-0" />
      <div className="login-radar pointer-events-none absolute left-1/2 top-1/2 size-[72rem] -translate-x-1/2 -translate-y-1/2" />
      <div className="login-radar-sweep pointer-events-none absolute left-1/2 top-1/2 size-[72rem] -translate-x-1/2 -translate-y-1/2" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[54rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/8" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[39rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-cyan-200/10 login-orbit" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/10 login-float-slow" />
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl login-drift" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-amber-300/15 blur-3xl login-drift" />

      {beacons.map((beacon) => (
        <span
          className="login-beacon pointer-events-none absolute rounded-full bg-cyan-300/80 shadow-[0_0_24px_rgba(103,232,249,0.95)]"
          key={`${beacon.left}-${beacon.top}`}
          style={{
            animationDelay: beacon.delay,
            height: `${beacon.size}px`,
            left: beacon.left,
            top: beacon.top,
            width: `${beacon.size}px`,
          }}
        />
      ))}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-64 items-end justify-center gap-4 opacity-35">
        {candleHeights.map((height, index) => (
          <span
            className="login-candle w-3 rounded-t-full bg-gradient-to-t from-cyan-500/0 via-cyan-300/50 to-amber-200/70"
            key={`${height}-${index}`}
            style={{
              animationDelay: `${index * 130}ms`,
              height: `${height}px`,
            }}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-[7%] bottom-0 h-56 overflow-hidden opacity-85">
        <div className="absolute inset-x-0 bottom-10 h-px bg-gradient-to-r from-transparent via-cyan-200/35 to-transparent" />
        <svg
          aria-hidden="true"
          className="absolute inset-x-0 bottom-10 h-36 w-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 860 170"
        >
          <path
            className="login-market-trace"
            d={tracePath}
            pathLength="1"
            stroke="url(#login-trace)"
            strokeLinecap="round"
            strokeWidth="3"
          />
          <path
            className="login-market-trace-faint"
            d={tracePath}
            pathLength="1"
            stroke="rgba(255,255,255,0.1)"
            strokeLinecap="round"
            strokeWidth="1.5"
          />
          <defs>
            <linearGradient id="login-trace" x1="0" x2="860" y1="0" y2="0">
              <stop offset="0%" stopColor="rgba(34,211,238,0.1)" />
              <stop offset="28%" stopColor="rgba(103,232,249,0.85)" />
              <stop offset="72%" stopColor="rgba(245,158,11,0.72)" />
              <stop offset="100%" stopColor="rgba(245,158,11,0.1)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-x-[10%] bottom-0 flex items-end justify-between gap-3">
          {marketColumns.map((height, index) => (
            <span
              className="login-candle w-4 rounded-t-full bg-gradient-to-t from-cyan-500/0 via-cyan-300/55 to-amber-200/75 opacity-55"
              key={`market-${height}-${index}`}
              style={{
                animationDelay: `${index * 140}ms`,
                height: `${height}px`,
              }}
            />
          ))}
        </div>
      </div>

      <section className="relative z-10 w-full max-w-[33rem] px-2 login-rise">
        <div className="login-card-shell">
          <div className="login-card-border absolute -inset-px rounded-[38px] bg-[conic-gradient(from_0deg,rgba(34,211,238,0.22),rgba(255,255,255,0.02),rgba(245,158,11,0.22),rgba(255,255,255,0.02),rgba(34,211,238,0.22))] opacity-90 blur-[2px]" />
          <div className="absolute -inset-10 rounded-[52px] bg-gradient-to-br from-cyan-300/22 via-transparent to-amber-300/14 blur-3xl" />
          <div className="relative overflow-hidden rounded-[36px] border border-white/10 bg-[#101722]/88 p-6 shadow-[0_40px_120px_-55px_rgba(0,0,0,0.95)] backdrop-blur-2xl sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(125,211,252,0.18),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.04),transparent_42%,rgba(255,255,255,0.02))]" />
            <div className="pointer-events-none absolute inset-x-6 top-5 flex items-center justify-between">
              <span className="h-px w-14 bg-gradient-to-r from-cyan-200/0 via-cyan-200/55 to-cyan-200/0" />
              <span className="h-2 w-2 rounded-full bg-cyan-200/70 shadow-[0_0_18px_rgba(125,211,252,0.95)] login-beacon" />
              <span className="h-px w-14 bg-gradient-to-r from-amber-200/0 via-amber-200/40 to-amber-200/0" />
            </div>
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent login-scan" />
            <div className="login-glimmer absolute -inset-y-8 left-[-30%] w-[35%] rotate-12 bg-gradient-to-r from-transparent via-white/12 to-transparent" />
            <div className="pointer-events-none absolute left-6 top-6 h-7 w-7 border-l border-t border-cyan-200/30" />
            <div className="pointer-events-none absolute bottom-6 right-6 h-7 w-7 border-b border-r border-amber-200/25" />
            <div className="relative">{children}</div>
          </div>
        </div>
      </section>
    </main>
  );
}
