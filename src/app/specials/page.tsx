import Link from "next/link";
import { Gift, Tag } from "lucide-react";
import { getLatestSpecials } from "@/lib/queries/public";
import { SectionHeader } from "@/components/home/section-header";
import { SectionShell } from "@/components/home/section-shell";
import { SpecialCard } from "@/components/specials/special-card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Specials",
  description: "Browse the latest deals and promotions from South African businesses.",
};

export default async function SpecialsPage() {
  const specials = await getLatestSpecials(24);

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <SectionShell>
        <section className="relative overflow-hidden rounded-3xl border border-sa-gold/20 bg-gradient-to-br from-sa-gold/25 via-white to-sa-red/10 px-6 py-8 shadow-sm sm:px-8 sm:py-10">
          <div className="pointer-events-none absolute -right-6 -top-6 rounded-full bg-sa-gold/20 p-8">
            <Gift className="h-20 w-20 text-sa-gold/35" aria-hidden />
          </div>
          <div className="relative max-w-2xl">
            <div className="flex items-center gap-2 text-sa-red">
              <Tag className="h-5 w-5" aria-hidden />
              <span className="text-sm font-semibold uppercase tracking-wider">FindMyBiz Deals</span>
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-sa-blue sm:text-4xl">
              Specials Board
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
              Latest deals from verified South African businesses.
            </p>
            <Button
              className="mt-6 h-11 rounded-lg bg-sa-gold px-5 text-sm font-semibold text-slate-900 shadow-sm hover:bg-sa-gold/90"
              asChild
            >
              <Link href="/dashboard/specials">Upload Specials</Link>
            </Button>
          </div>
        </section>

        <section className="pt-8 sm:pt-10">
          <SectionHeader title="Latest Deals" />
          {specials.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {specials.map((special) => (
                <SpecialCard key={special.id} special={special} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-sa-gold/50 bg-white px-6 py-12 text-center shadow-sm">
              <Gift className="mx-auto h-11 w-11 text-sa-gold" aria-hidden />
              <h2 className="mt-4 text-xl font-bold text-sa-blue">No active specials right now</h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
                Check back soon or list your business promotion for customers across South Africa.
              </p>
              <Button
                className="mt-6 h-11 rounded-lg bg-sa-gold px-5 text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
                asChild
              >
                <Link href="/dashboard/specials">Upload Specials</Link>
              </Button>
            </div>
          )}
        </section>
      </SectionShell>
    </main>
  );
}
