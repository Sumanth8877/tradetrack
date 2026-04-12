import OpenAI from "openai";

import { getOpenAiEnv } from "@/lib/env";
import type { InsightKind } from "@/lib/types";

let cachedClient: OpenAI | null = null;

function getClient() {
  if (!cachedClient) {
    const env = getOpenAiEnv();
    cachedClient = new OpenAI({ apiKey: env.key });
  }

  return cachedClient;
}

const instructionByKind: Record<InsightKind, string> = {
  daily:
    "You are a trading performance coach. Return exactly two short bullet points. Keep each bullet under 16 words, focus on behavior and risk control, and do not add a heading.",
  weekly:
    "You are a trading review coach. Return exactly three short bullet points. Mention behavior, recurring mistakes, and one next-week adjustment. No heading.",
};

export async function generateInsightCopy({
  kind,
  summary,
  userId,
}: {
  kind: InsightKind;
  summary: Record<string, unknown>;
  userId: string;
}) {
  const env = getOpenAiEnv();
  const response = await getClient().responses.create({
    input: JSON.stringify(summary, null, 2),
    instructions: instructionByKind[kind],
    max_output_tokens: kind === "daily" ? 90 : 130,
    metadata: {
      kind,
      source: "tradetrack",
      user_id: userId.slice(0, 64),
    },
    model: env.model,
    reasoning: {
      effort: "minimal",
    },
  });

  const output = response.output_text
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");

  if (!output) {
    throw new Error("OpenAI returned an empty response.");
  }

  return {
    body: output,
    model: env.model,
  };
}
