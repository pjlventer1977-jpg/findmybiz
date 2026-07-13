import Link from "next/link";
import { Gift, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionShell } from "@/components/home/section-shell";

export function PromoBannersSection() {
  return (
    <section className="bg-white py-6 sm:py-8">
      <SectionShell>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-sm">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h2 className="text-xl font-bold sm:text-2xl">Need a service?</h2>
                <p className="mt-2 max-w-md text-sm text-emerald-50">
                  Describe what you need and receive up to 5 competitive quotes from verified local businesses.
                </p>
                <Button
                  className="mt-4 h-10 rounded-lg bg-white px-5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                  asChild
                >
                  <Link href="/get-quotes">Get 5 Quotes Now</Link>
                </Button>
              </div>
              <div className="hidden rounded-2xl bg-white/10 p-5 sm:block">
                <MessageCircle className="h-16 w-16 text-white/90" aria-hidden />
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100 p-6 shadow-sm ring-1 ring-amber-100">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h2 className="text-xl font-bold text-amber-950 sm:text-2xl">
                  Today&apos;s Specials
                </h2>
                <p className="mt-2 max-w-md text-sm text-amber-900">
                  Amazing deals from local businesses. Limited-time offers across South Africa.
                </p>
                <Button
                  className="mt-4 h-10 rounded-lg bg-amber-400 px-5 text-sm font-semibold text-amber-950 hover:bg-amber-300"
                  asChild
                >
                  <Link href="/specials">View Specials</Link>
                </Button>
              </div>
              <div className="hidden rounded-2xl bg-white/70 p-5 sm:block">
                <Gift className="h-16 w-16 text-amber-500" aria-hidden />
              </div>
            </div>
          </div>
        </div>
      </SectionShell>
    </section>
  );
}
