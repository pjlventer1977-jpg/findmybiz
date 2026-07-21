import { getProvinces, getCategories } from "@/lib/queries/public";
import { Check, Smartphone } from "lucide-react";
import { SectionShell } from "@/components/home/section-shell";
import { QuoteRequestForm } from "./quote-form";

const QUOTE_CHECKLIST = [
  "Plumbing & Electrical",
  "Renovations & Building",
  "Cleaning & Gardening",
  "IT & Web Services",
] as const;

export const metadata = {
  title: "Get 5 Quotes",
  description: "Request up to 5 quotes from verified South African businesses in your area.",
};

export default async function GetQuotesPage() {
  const [provinces, categories] = await Promise.all([
    getProvinces(),
    getCategories(),
  ]);

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-10">
      <SectionShell>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <div className="min-w-0">
            <section className="mb-6 rounded-2xl border border-sa-green/15 bg-gradient-to-br from-sa-green/10 via-white to-sa-gold/10 px-5 py-6 sm:px-7">
              <h1 className="text-3xl font-bold tracking-tight text-sa-blue sm:text-4xl">
                Get 5 Quotes
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-700 sm:text-base">
                Tell us what you need — we&apos;ll connect you with up to 5 verified businesses in your area.
              </p>
              <ol className="mt-5 flex flex-wrap gap-2">
                {[
                  "1. Describe job",
                  "2. We match businesses",
                  "3. Receive quotes",
                ].map((step) => (
                  <li
                    key={step}
                    className="rounded-full border border-sa-green/20 bg-white/80 px-3 py-1.5 text-xs font-semibold text-sa-blue shadow-sm"
                  >
                    {step}
                  </li>
                ))}
              </ol>
            </section>
            <QuoteRequestForm provinces={provinces} categories={categories} />
          </div>

          <aside className="order-first h-fit rounded-2xl border border-slate-200 bg-gradient-to-br from-sa-blue to-sa-green p-5 text-white shadow-sm lg:order-none lg:sticky lg:top-24">
            <h2 className="text-lg font-bold leading-tight">Get 5 Quotes — It&apos;s Free!</h2>
            <p className="mt-2 text-sm text-white/90">
              Describe your job once and receive up to five competitive quotes from verified local businesses.
            </p>
            <ul className="mt-4 space-y-2">
              {QUOTE_CHECKLIST.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 shrink-0 text-sa-gold" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden rounded-xl bg-white/10 p-4 sm:block">
              <Smartphone className="mx-auto h-12 w-12 text-white/80" aria-hidden />
            </div>
            <p className="mt-5 text-center text-xs leading-relaxed text-white/75">
              Free for customers · Verified businesses only · POPIA compliant
            </p>
          </aside>
        </div>
      </SectionShell>
    </main>
  );
}
