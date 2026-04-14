import OpenAI from "openai";

import type { DeepSeekRuntimeConfig } from "@/lib/deepseek-settings";
import type { WorkspaceAnalyticsInsightPayload } from "@/lib/workspace-analytics-ai";

function createClient(config: DeepSeekRuntimeConfig) {
  return new OpenAI({
    apiKey: config.key,
    baseURL: config.baseUrl,
  });
}

const analyticsInstructions =
  "You are a trading analytics reviewer for a two-person workspace. Return exactly four short bullet points. Cover: one strength, one risk, one pattern worth watching, and one next action. Keep each bullet under 22 words. Do not add a heading.";

export async function generateWorkspaceAnalyticsInsight(
  payload: WorkspaceAnalyticsInsightPayload,
  config: DeepSeekRuntimeConfig,
) {
  const completion = await createClient(config).chat.completions.create({
    messages: [
      {
        role: "system",
        content: analyticsInstructions,
      },
      {
        role: "user",
        content: JSON.stringify(payload, null, 2),
      },
    ],
    max_tokens: 320,
    model: config.model,
    temperature: 0.2,
  });

  const rawContent = completion.choices[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : "";

  const body = content
    .replace(/\r/g, "")
    .split("\n")
    .map((line: string) => line.trim())
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
