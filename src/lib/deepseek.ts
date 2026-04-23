import type { DeepSeekRuntimeConfig } from "@/lib/deepseek-settings";
import type { WorkspaceAnalyticsInsightPayload } from "@/lib/workspace-analytics-ai";

const analyticsInstructions =
  "You are a trading analytics reviewer for a two-person workspace. Return exactly four short bullet points. Cover: one strength, one risk, one pattern worth watching, and one next action. Keep each bullet under 22 words. Do not add a heading.";

type DeepSeekCompletionResponse = {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            text?: string;
            type?: string;
          }>;
    };
  }>;
  error?: {
    message?: string;
  };
};

function getCompletionsUrl(baseUrl: string) {
  return new URL("chat/completions", `${baseUrl.replace(/\/+$/, "")}/`).toString();
}

type DeepSeekMessageContent =
  NonNullable<NonNullable<DeepSeekCompletionResponse["choices"]>[number]["message"]>["content"];

function readCompletionContent(content: DeepSeekMessageContent) {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => (typeof part?.text === "string" ? part.text : ""))
    .join("");
}

export async function generateWorkspaceAnalyticsInsight(
  payload: WorkspaceAnalyticsInsightPayload,
  config: DeepSeekRuntimeConfig,
) {
  const response = await fetch(getCompletionsUrl(config.baseUrl), {
    body: JSON.stringify({
      max_tokens: 320,
      messages: [
        {
          content: analyticsInstructions,
          role: "system",
        },
        {
          content: JSON.stringify(payload, null, 2),
          role: "user",
        },
      ],
      model: config.model,
      temperature: 0.2,
    }),
    headers: {
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
    },
    method: "POST",
  });
  const completion = (await response.json()) as DeepSeekCompletionResponse;

  if (!response.ok) {
    throw new Error(
      completion.error?.message ??
        `DeepSeek request failed with status ${response.status}.`,
    );
  }

  const content = readCompletionContent(completion.choices?.[0]?.message?.content);

  const body = content
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  if (!body) {
    throw new Error("DeepSeek returned an empty analytics response.");
  }

  return {
    body,
    model: config.model,
  };
}
