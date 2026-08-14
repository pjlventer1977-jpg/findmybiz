import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { randomUUID } from "crypto";
import { getAssistantSystemPrompt } from "@/lib/assistant/knowledge";
import { checkAssistantRateLimit } from "@/lib/assistant/rate-limit";
import {
  SEARCH_LISTINGS_TOOL,
  searchListingsTool,
  type AssistantListing,
} from "@/lib/assistant/tools";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const COOKIE_NAME = "fmb_asst";
const MAX_MESSAGES = 12;
const MAX_CONTENT = 2000;

type ChatRole = "user" | "assistant";

function isAssistantEnabled() {
  return Boolean(process.env.OPENAI_API_KEY?.trim());
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

  if (messages.length === 0 || messages[messages.length - 1]?.role !== "user") {
    return withCookie(
      NextResponse.json({ error: "Send a message to continue." }, { status: 400 }),
      cookieId,
      setCookie
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const openaiMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: getAssistantSystemPrompt() },
    ...messages,
  ];

  let listings: AssistantListing[] = [];

  try {
    for (let round = 0; round < 3; round += 1) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        temperature: 0.3,
        max_tokens: 500,
        tools: [SEARCH_LISTINGS_TOOL],
        messages: openaiMessages,
      });

      const choice = completion.choices[0];
      const assistantMessage = choice?.message;
      if (!assistantMessage) {
        throw new Error("Empty model response");
      }

      const toolCalls = assistantMessage.tool_calls ?? [];
      if (toolCalls.length === 0 || choice.finish_reason === "stop") {
        const text = assistantMessage.content?.trim() || "I can help you find a local business or request quotes.";
        const response = NextResponse.json({ message: text, listings });
        return withCookie(response, cookieId, setCookie);
      }

      openaiMessages.push(assistantMessage);

      for (const toolCall of toolCalls) {
        if (toolCall.type !== "function" || toolCall.function.name !== "search_listings") {
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

    const fallback = NextResponse.json({
      message: listings.length
        ? "Here are approved listings I found. Open a profile or request quotes if you need more matches."
        : "I could not finish that search. Try /search or /get-quotes, or email support@findmybiz.co.za.",
      listings,
    });
    return withCookie(fallback, cookieId, setCookie);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown";
    console.error("Assistant chat failed:", detail);
    const response = NextResponse.json(
      { error: "The assistant could not reply. Please try again." },
      { status: 502 }
    );
    return withCookie(response, cookieId, setCookie);
  }
}
