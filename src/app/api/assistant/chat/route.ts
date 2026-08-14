import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { fallbackAssistantReply } from "@/lib/assistant/fallback";
import { getAssistantSystemPrompt } from "@/lib/assistant/knowledge";
import {
  createChatCompletion,
  getOpenAIApiKey,
  OpenAIRequestError,
  type OpenAIChatMessage,
} from "@/lib/assistant/openai-client";
import { checkAssistantRateLimit } from "@/lib/assistant/rate-limit";
import { searchListingsTool, type AssistantListing } from "@/lib/assistant/tools";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const COOKIE_NAME = "fmb_asst";
const MAX_MESSAGES = 12;
const MAX_CONTENT = 2000;

type ChatRole = "user" | "assistant";

function isAssistantEnabled() {
  return Boolean(getOpenAIApiKey());
}

function clientKey(request: NextRequest, cookieId: string) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return `${ip}:${cookieId}`;
}

function ensureCookieId(request: NextRequest): { id: string; setCookie: boolean } {
  const existing = request.cookies.get(COOKIE_NAME)?.value;
  if (existing && existing.length <= 64) return { id: existing, setCookie: false };
  return { id: randomUUID(), setCookie: true };
}

function withCookie(response: NextResponse, cookieId: string, setCookie: boolean) {
  if (setCookie) {
    response.cookies.set(COOKIE_NAME, cookieId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  return response;
}

function visitorError(status: number, code?: string) {
  if (status === 401 || status === 403) {
    return "The assistant is not fully connected yet. Please try again later or email support@findmybiz.co.za.";
  }
  if (status === 429 || code === "insufficient_quota") {
    return "The assistant is busy right now. Please try again in a minute, or use Search / Get 5 Quotes.";
  }
  return "The assistant could not reply. Please try again, or use Search / Get 5 Quotes.";
}

export async function GET() {
  return NextResponse.json({ enabled: isAssistantEnabled() });
}

export async function POST(request: NextRequest) {
  if (!isAssistantEnabled()) {
    return NextResponse.json(
      { error: "Assistant is not configured yet." },
      { status: 503 }
    );
  }

  const { id: cookieId, setCookie } = ensureCookieId(request);
  const limit = checkAssistantRateLimit(clientKey(request, cookieId));
  if (!limit.ok) {
    const response = NextResponse.json(
      { error: "Too many messages. Please try again in a few minutes." },
      { status: 429 }
    );
    response.headers.set("Retry-After", String(limit.retryAfterSeconds));
    return withCookie(response, cookieId, setCookie);
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return withCookie(
      NextResponse.json({ error: "Invalid request." }, { status: 400 }),
      cookieId,
      setCookie
    );
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const messages: { role: ChatRole; content: string }[] = incoming
    .filter(
      (item): item is { role: ChatRole; content: string } =>
        item &&
        typeof item === "object" &&
        (item.role === "user" || item.role === "assistant") &&
        typeof item.content === "string"
    )
    .map((item) => ({
      role: item.role,
      content: item.content.trim().slice(0, MAX_CONTENT),
    }))
    .filter((item) => item.content.length > 0)
    .slice(-MAX_MESSAGES);

  const lastUser = messages[messages.length - 1];
  if (!lastUser || lastUser.role !== "user") {
    return withCookie(
      NextResponse.json({ error: "Send a message to continue." }, { status: 400 }),
      cookieId,
      setCookie
    );
  }

  const openaiMessages: OpenAIChatMessage[] = [
    { role: "system", content: getAssistantSystemPrompt() },
    ...messages.map((item) => ({ role: item.role, content: item.content })),
  ];

  let listings: AssistantListing[] = [];

  try {
    for (let round = 0; round < 3; round += 1) {
      const completion = await createChatCompletion(openaiMessages);

      if (completion.toolCalls.length === 0 || completion.finishReason === "stop") {
        const text =
          completion.content ||
          "I can help you find a local business or request quotes.";
        return withCookie(
          NextResponse.json({ message: text, listings }),
          cookieId,
          setCookie
        );
      }

      openaiMessages.push({
        role: "assistant",
        content: completion.content || null,
        tool_calls: completion.toolCalls,
      });

      for (const toolCall of completion.toolCalls) {
        if (toolCall.function.name !== "search_listings") {
          openaiMessages.push({
            role: "tool",
            tool_call_id: toolCall.id,
            content: JSON.stringify({ error: "Unknown tool" }),
          });
          continue;
        }

        let args: { q?: string; province?: string; city?: string } = {};
        try {
          args = JSON.parse(toolCall.function.arguments || "{}") as typeof args;
        } catch {
          args = {};
        }

        const result = await searchListingsTool(args);
        if (result.listings.length > 0) {
          listings = result.listings;
        }

        openaiMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }
    }

    if (listings.length > 0) {
      return withCookie(
        NextResponse.json({
          message:
            "Here are approved listings I found. Open a profile or request quotes if you need more matches.",
          listings,
        }),
        cookieId,
        setCookie
      );
    }

    const fallback = await fallbackAssistantReply(lastUser.content);
    return withCookie(NextResponse.json(fallback), cookieId, setCookie);
  } catch (error) {
    const status = error instanceof OpenAIRequestError ? error.status : 502;
    const detail = error instanceof Error ? error.message : "unknown";
    const code = error instanceof OpenAIRequestError ? error.code : undefined;
    console.error("Assistant chat failed:", { status, code, detail });

    try {
      const fallback = await fallbackAssistantReply(lastUser.content);
      return withCookie(NextResponse.json(fallback), cookieId, setCookie);
    } catch (fallbackError) {
      console.error(
        "Assistant fallback failed:",
        fallbackError instanceof Error ? fallbackError.message : fallbackError
      );
      return withCookie(
        NextResponse.json({ error: visitorError(status, code) }, { status: 502 }),
        cookieId,
        setCookie
      );
    }
  }
}
