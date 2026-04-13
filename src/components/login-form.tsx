"use client";

import { useActionState } from "react";

import { signInAction } from "@/app/actions";
import { LoginSubmitButton } from "@/components/login-submit-button";
import { PasswordResetDialog } from "@/components/password-reset-dialog";
import { inputClass, labelClass } from "@/lib/styles";

const initialState = null;

async function submitLogin(_state: typeof initialState, formData: FormData) {
  await signInAction(formData);
  return null;
}

export function LoginForm() {
  const [, formAction, pending] = useActionState(submitLogin, initialState);

  return (
    <>
      <form
        action={formAction}
        autoComplete="off"
        className="mt-8 space-y-5"
        id="sign-in-form"
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
            placeholder="Enter password"
            required
            type="password"
          />
        </div>
      </form>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <LoginSubmitButton formId="sign-in-form" pending={pending} />
        <PasswordResetDialog />
      </div>
    </>
  );
}
