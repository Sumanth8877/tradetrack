"use client";

import {
  useActionState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { useFormStatus } from "react-dom";

import {
  deleteDeepSeekApiKeyAction,
  saveDeepSeekApiKeyAction,
} from "@/app/actions";
import {
  Button,
  Field,
  Input,
  Panel,
  Pill,
  SectionTitle,
} from "@/components/workspace/workspace-ui";

type SettingsFormState = {
  message: string;
  status: "error" | "idle" | "success";
};

type SettingsPageProps = {
  apiKeySummary: {
    hasStoredApiKey: boolean;
    maskedStoredApiKey: string | null;
    source: "cookie" | "env" | "none";
  };
};

const initialFormState: SettingsFormState = {
  message: "",
  status: "idle",
};

function SettingsSubmitButton({
  children,
  pendingLabel,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingLabel: string;
  variant?: "ghost" | "primary" | "secondary";
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      disabled={pending || props.disabled}
      variant={variant}
    >
      {pending ? pendingLabel : children}
    </Button>
  );
}

export function SettingsPage({ apiKeySummary }: SettingsPageProps) {
  const [saveState, saveAction] = useActionState(
    saveDeepSeekApiKeyAction,
    initialFormState,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteDeepSeekApiKeyAction,
    initialFormState,
  );
  const statusTone =
    apiKeySummary.source === "cookie"
      ? "emerald"
      : apiKeySummary.source === "env"
        ? "cyan"
        : "amber";
  const statusLabel =
    apiKeySummary.source === "cookie"
      ? "Saved"
      : apiKeySummary.source === "env"
        ? "Environment"
        : "Not configured";
  const statusDescription =
    apiKeySummary.source === "cookie"
      ? `Stored key ${apiKeySummary.maskedStoredApiKey}. Paste a new key any time to replace it.`
      : apiKeySummary.source === "env"
        ? "Analytics is using the server environment key right now. Saving here will override it for your current browser."
        : "No DeepSeek key is configured yet. Paste one below to enable AI analytics.";

  return (
    <Panel className="space-y-6">
      <SectionTitle
        description="Paste a DeepSeek API key to enable server-side analytics for this workspace session."
        title="API Management"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            Provider
          </p>
          <p className="mt-3 text-base font-semibold text-zinc-50">
            DeepSeek
          </p>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            Analytics requests use your saved key first, then fall back to the server environment key.
          </p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            Status
          </p>
          <div className="mt-3">
            <Pill tone={statusTone}>{statusLabel}</Pill>
          </div>
          <p className="mt-2 text-sm leading-6 text-zinc-300">
            {statusDescription}
          </p>
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-black/18 p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <form action={saveAction} className="space-y-4">
            <Field
              hint="The raw key is submitted to a server action and stored in an HttpOnly cookie, so client-side scripts cannot read it back."
              label="DeepSeek API Key"
            >
              <Input
                autoComplete="new-password"
                name="api_key"
                placeholder={
                  apiKeySummary.hasStoredApiKey
                    ? "Paste a new DeepSeek API key to replace the saved one"
                    : "Paste your DeepSeek API key"
                }
                spellCheck={false}
                type="password"
              />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <SettingsSubmitButton
                pendingLabel={
                  apiKeySummary.hasStoredApiKey ? "Updating..." : "Saving..."
                }
                type="submit"
                variant="primary"
              >
                {apiKeySummary.hasStoredApiKey ? "Update key" : "Save key"}
              </SettingsSubmitButton>
              <Pill tone="zinc">Server-side only</Pill>
            </div>

            {saveState.status !== "idle" ? (
              <p
                aria-live="polite"
                className={
                  saveState.status === "success"
                    ? "text-sm text-emerald-300"
                    : "text-sm text-rose-300"
                }
              >
                {saveState.message}
              </p>
            ) : null}
          </form>

          <div className="space-y-3 xl:min-w-44">
            {apiKeySummary.hasStoredApiKey ? (
              <form action={deleteAction} className="space-y-3">
                <SettingsSubmitButton
                  className="w-full"
                  pendingLabel="Deleting..."
                  type="submit"
                  variant="secondary"
                >
                  Delete key
                </SettingsSubmitButton>

                {deleteState.status !== "idle" ? (
                  <p
                    aria-live="polite"
                    className={
                      deleteState.status === "success"
                        ? "text-sm text-emerald-300"
                        : "text-sm text-rose-300"
                    }
                  >
                    {deleteState.message}
                  </p>
                ) : null}
              </form>
            ) : null}
            <p className="text-xs leading-5 text-zinc-400">
              Save overwrites the currently stored key. Delete removes only the key saved from this settings page.
            </p>
          </div>
        </div>

        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Analytics calls stay on the server through API routes. The browser never calls DeepSeek directly.
        </p>
      </div>
    </Panel>
  );
}
