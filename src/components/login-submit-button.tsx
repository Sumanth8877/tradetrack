"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import { primaryButtonClass } from "@/lib/styles";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${primaryButtonClass} group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden border border-cyan-200/15 px-6 shadow-[0_0_55px_-14px_rgba(103,232,249,0.95)]`}
      disabled={pending}
      type="submit"
    >
      <span className="login-glimmer absolute -inset-y-6 left-[-30%] w-[40%] rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      <span className="relative flex items-center gap-2">
        {pending ? (
          <>
            <LoaderCircle className="size-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            Open dashboard
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </>
        )}
      </span>
    </button>
  );
}
