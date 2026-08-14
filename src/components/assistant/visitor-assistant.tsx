"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Loader2, Send, X } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { AssistantListing } from "@/lib/assistant/types";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  listings?: AssistantListing[];
};

const SUGGESTIONS = [
  "Find a plumber",
  "How do quotes work?",
  "List my business",
] as const;

const HIDDEN_PREFIXES = ["/dashboard", "/admin"];

export function VisitorAssistant() {
  const pathname = usePathname();
  const [enabled, setEnabled] = useState(false);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi, I’m Bizzy — always on the lookout to help you find a local business or request quotes. What do you need?",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const hidden = HIDDEN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  useEffect(() => {
    if (hidden) return;
    let cancelled = false;
    fetch("/api/assistant/chat")
      .then((response) => response.json())
      .then((data: { enabled?: boolean }) => {
        if (!cancelled) setEnabled(Boolean(data.enabled));
      })
      .catch(() => {
        if (!cancelled) setEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, [hidden]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open, loading]);

  if (hidden || !enabled) return null;

  async function send(text: string) {
    const content = text.trim();
    if (!content || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content: body }) => ({ role, content: body })),
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "The assistant could not reply.");
      }

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: String(data.message ?? ""),
          listings: Array.isArray(data.listings) ? data.listings : [],
        },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "The assistant could not reply.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col items-end gap-3">
      {open && (
        <div className="flex h-[min(32rem,calc(100vh-7rem))] w-[min(100vw-2rem,24rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between bg-sa-blue px-4 py-3 text-white">
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src="/assistant/bizzy.png"
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 rounded-full border-2 border-white/30 bg-white object-cover object-top"
                unoptimized
              />
              <div className="min-w-0">
                <p className="text-sm font-semibold">Bizzy</p>
                <p className="text-xs text-white/80">FindMyBiz assistant · Find. Connect. Grow.</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close assistant"
              className="rounded-md p-1 hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div ref={listRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex max-w-[90%] gap-2 ${
                  message.role === "user" ? "ml-auto flex-row-reverse" : "items-end"
                }`}
              >
                {message.role === "assistant" && (
                  <Image
                    src="/assistant/bizzy.png"
                    alt=""
                    width={28}
                    height={28}
                    className="mb-0.5 h-7 w-7 shrink-0 rounded-full bg-white object-cover object-top"
                    unoptimized
                  />
                )}
                <div
                  className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-sa-blue text-white"
                      : "bg-slate-100 text-slate-800"
                  }`}
                >
                <p className="whitespace-pre-wrap">{message.content}</p>
                {message.listings && message.listings.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {message.listings.map((listing) => (
                      <li key={listing.slug}>
                        <Link
                          href={listing.href}
                          className="block rounded-lg border border-sa-green/20 bg-white px-2.5 py-2 text-sa-blue hover:border-sa-green/40"
                        >
                          <span className="font-semibold">{listing.name}</span>
                          {(listing.city || listing.province) && (
                            <span className="mt-0.5 block text-xs text-slate-500">
                              {[listing.city, listing.province].filter(Boolean).join(", ")}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
                {message.listings && message.listings.length > 0 && (
                  <p className="mt-2 text-xs">
                    <Link href="/get-quotes" className="font-semibold text-sa-green hover:underline">
                      Request up to 5 quotes
                    </Link>
                  </p>
                )}
                </div>
              </div>
            ))}
            {loading && (
              <p className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Looking that up…
              </p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          {messages.length < 3 && (
            <div className="flex flex-wrap gap-1.5 border-t border-slate-100 px-3 py-2">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-sa-blue hover:border-sa-green/40 hover:bg-sa-green/5"
                  onClick={() => send(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form
            className="flex gap-2 border-t border-slate-100 p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about a service or town…"
              maxLength={2000}
              className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
            />
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-10 w-10 shrink-0 bg-sa-gold text-slate-900 hover:bg-sa-gold/90"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      )}

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? "Close Bizzy" : "Open Bizzy, FindMyBiz assistant"}
        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-sa-gold shadow-lg ring-2 ring-sa-blue/20 transition hover:scale-105"
        onClick={() => setOpen((current) => !current)}
      >
        <Image
          src="/assistant/bizzy.png"
          alt="Bizzy"
          width={64}
          height={64}
          className="h-16 w-16 object-cover object-top"
          unoptimized
        />
      </button>
    </div>
  );
}
