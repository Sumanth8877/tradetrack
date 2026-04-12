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
        className={secondaryButtonClass}
        onClick={() => dialogRef.current?.showModal()}
        type="button"
      >
        Reset password
      </button>
      <dialog
        className="w-[min(92vw,34rem)] rounded-[28px] border border-white/10 bg-[#11141c] p-0 text-zinc-100 shadow-[0_28px_120px_-48px_rgba(0,0,0,0.95)] backdrop:bg-black/75"
        ref={dialogRef}
      >
        <div className="space-y-6 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-zinc-50">
                Reset Password
              </h2>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Reset either account with its username and a new password.
              </p>
            </div>
            <button
              className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300 transition hover:bg-white/10"
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
                className={inputClass}
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
                className={inputClass}
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
                className={inputClass}
                id="reset-confirm-password"
                minLength={8}
                name="confirm_password"
                placeholder="Confirm new password"
                required
                type="password"
              />
            </div>
            <SubmitButton
              className={secondaryButtonClass}
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
