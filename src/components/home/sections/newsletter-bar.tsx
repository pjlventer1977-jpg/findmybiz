"use client";

import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionShell } from "@/components/home/section-shell";

export function NewsletterBar() {
  return (
    <section className="bg-sa-blue py-8 text-white">
      <SectionShell className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
            <Mail className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="font-semibold">Stay updated</p>
            <p className="text-sm text-white/80">
              Get the latest deals, events and business tips.
            </p>
          </div>
        </div>
        <form
          className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            type="email"
            placeholder="Your email address"
            disabled
            className="h-10 min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/60"
          />
          <Button
            type="button"
            disabled
            className="h-10 shrink-0 rounded-lg bg-sa-gold px-5 text-sm font-semibold text-slate-900 opacity-80"
            title="Coming soon"
          >
            Subscribe
          </Button>
        </form>
      </SectionShell>
    </section>
  );
}
