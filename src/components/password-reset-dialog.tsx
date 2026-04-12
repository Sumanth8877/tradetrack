"use client";

import { useRef } from "react";

import { resetPasswordAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import {
  inputClass,
  labelClass,
  secondaryButtonClass,
} from "@/lib/styles";

export function PasswordResetDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        className={`${secondaryButtonClass} h-12 px-6`}
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        Reset password
      </button>
      <dialog
        className="fixed left-1/2 top-1/2 m-0 max-h-[90vh] w-[min(92vw,34rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[32px] border border-white/10 bg-[#0d1420] p-0 text-zinc-100 shadow-[0_28px_120px_-48px_rgba(0,0,0,0.95)] backdrop:bg-black/80"
        ref={dialogRef}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(125,211,252,0.18),transparent_32%),radial-gradient(circle_at_90%_20%,rgba(245,193,91,0.12),transparent_28%)]" />
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
        <div className="relative max-h-[90vh] space-y-6 overflow-y-auto p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cyan-200/80">
                Account recovery
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-50">
                Reset Password
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Reset either account with its username and a new password.
              </p>
            </div>
            <button
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-sm text-zinc-300 transition hover:bg-white/10"
              onClick={() => dialogRef.current?.close()}
              type="button"
            >
              Close
            </button>
          </div>

          <form
            action={resetPasswordAction}
            autoComplete="off"
            className="space-y-4"
          >
            <div>
              <label className={labelClass} htmlFor="reset-username">
                Username
              </label>
              <input
                autoComplete="off"
                className={`${inputClass} h-13 bg-black/35`}
                id="reset-username"
                name="username"
                placeholder="Enter username"
                required
                type="text"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="reset-new-password">
                New password
              </label>
              <input
                autoComplete="off"
                className={`${inputClass} h-13 bg-black/35`}
                id="reset-new-password"
                minLength={8}
                name="password"
                placeholder="Enter new password"
                required
                type="password"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="reset-confirm-password">
                Confirm password
              </label>
              <input
                autoComplete="off"
                className={`${inputClass} h-13 bg-black/35`}
                id="reset-confirm-password"
                minLength={8}
                name="confirm_password"
                placeholder="Confirm new password"
                required
                type="password"
              />
            </div>
            <SubmitButton
              className={`${secondaryButtonClass} h-12 px-6`}
              pendingLabel="Resetting..."
            >
              Reset
            </SubmitButton>
          </form>
        </div>
      </dialog>
    </>
  );
}
