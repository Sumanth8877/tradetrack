"use client";

import { ArrowRight, LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { FlashBanner } from "@/components/flash-banner";
import { createClient } from "@/lib/supabase/client";
import {
  inputClass,
  labelClass,
  primaryButtonClass,
} from "@/lib/styles";

type LoginUser = {
  aliases?: string[];
  email: string;
  username: string;
};

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function getAuthUserByUsername(users: LoginUser[], username: string) {
  const normalizedUsername = normalizeUsername(username);

  return (
    users.find(
      (user) =>
        normalizeUsername(user.username) === normalizedUsername ||
        user.aliases?.some(
          (alias) => normalizeUsername(alias) === normalizedUsername,
        ),
    ) ?? null
  );
}

export function UsernameLoginForm({
  flashCode,
  users,
}: {
  flashCode?: string;
  users: LoginUser[];
}) {
  const router = useRouter();
  const [supabase] = useState(createClient);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <FlashBanner code={errorCode ?? flashCode} />

      <form
        autoComplete="off"
        className="mt-8 space-y-5"
        onSubmit={async (event) => {
          event.preventDefault();

          if (isSubmitting) {
            return;
          }

          const formData = new FormData(event.currentTarget);
          const username = String(formData.get("username") ?? "").trim();
          const password = String(formData.get("password") ?? "").trim();
          const authUser = getAuthUserByUsername(users, username);

          if (!authUser || password.length < 8) {
            setErrorCode(!authUser ? "login_failed" : "invalid_input");
            return;
          }

          setErrorCode(null);
          setIsSubmitting(true);

          const { error } = await supabase.auth.signInWithPassword({
            email: authUser.email,
            password,
          });

          if (error) {
            setIsSubmitting(false);
            setErrorCode("login_failed");
            return;
          }

          router.replace("/");
          router.refresh();
        }}
      >
        <div className="group relative">
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent opacity-0 transition duration-300 group-focus-within:opacity-100" />
          <label className={labelClass} htmlFor="login-username">
            Username
          </label>
          <input
            autoComplete="off"
            className={`${inputClass} login-input h-14 border-white/12 bg-black/40 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]`}
            id="login-username"
            name="username"
            onChange={() => setErrorCode(null)}
            placeholder="Enter username"
            required
            type="text"
          />
        </div>
        <div className="group relative">
          <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent opacity-0 transition duration-300 group-focus-within:opacity-100" />
          <label className={labelClass} htmlFor="login-password">
            Password
          </label>
          <input
            autoComplete="off"
            className={`${inputClass} login-input h-14 border-white/12 bg-black/40 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]`}
            id="login-password"
            minLength={8}
            name="password"
            onChange={() => setErrorCode(null)}
            placeholder="Enter password"
            required
            type="password"
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            aria-busy={isSubmitting}
            className={`${primaryButtonClass} group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden border border-cyan-200/15 px-6 shadow-[0_0_55px_-14px_rgba(103,232,249,0.95)]`}
            disabled={isSubmitting}
            type="submit"
          >
            <span className="login-glimmer absolute -inset-y-6 left-[-30%] w-[40%] rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="relative flex items-center gap-2">
              {isSubmitting ? (
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
        </div>
      </form>
    </>
  );
}
