import { SEARCH_LISTINGS_TOOL } from "@/lib/assistant/tools";

export interface OpenAIChatMessage {
  role: "system" | "user" | "assistant" | "tool";
  content?: string | null;
  tool_call_id?: string;
  tool_calls?: Array<{
    id: string;
    type: "function";
    function: { name: string; arguments: string };
  }>;
}

interface OpenAIChatResponse {
  error?: { message?: string; type?: string; code?: string };
  choices?: Array<{
    finish_reason?: string;
    message?: {
      role?: string;
      content?: string | null;
      tool_calls?: Array<{
        id: string;
        type?: string;
        function?: { name?: string; arguments?: string };
      }>;
    };
  }>;
}

export function getOpenAIApiKey(): string | null {
  const raw = process.env.OPENAI_API_KEY?.trim();
  if (!raw) return null;
  return raw.replace(/^["']|["']$/g, "").trim() || null;
}

export class OpenAIRequestError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function createChatCompletion(messages: OpenAIChatMessage[]) {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new OpenAIRequestError(503, "OPENAI_API_KEY is not set");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 500,
      tools: [SEARCH_LISTINGS_TOOL],
      messages,
    }),
  });

  const data = (await response.json()) as OpenAIChatResponse;
  if (!response.ok) {
    throw new OpenAIRequestError(
      response.status,
      data.error?.message ?? `OpenAI request failed (${response.status})`,
      data.error?.code
    );
  }

  const choice = data.choices?.[0];
  const message = choice?.message;
  if (!message) {
    throw new OpenAIRequestError(502, "Empty model response");
  }

  const toolCalls = (message.tool_calls ?? [])
    .filter((call) => call.id && call.function?.name)
    .map((call) => ({
      id: call.id,
      type: "function" as const,
      function: {
        name: call.function!.name!,
        arguments: call.function?.arguments ?? "{}",
      },
    }));

  return {
    finishReason: choice.finish_reason ?? "stop",
    content: message.content?.trim() ?? "",
    toolCalls,
  };
}
