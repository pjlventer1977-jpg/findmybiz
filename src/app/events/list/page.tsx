import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { EventAdvertForm } from "./event-advert-form";

export const metadata = {
  title: "List an Event",
  description: "Advertise your South African event on Find My Biz.",
};

export default async function EventListingPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const { cancelled } = await searchParams;

  return (
    <main className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto grid w-full max-w-4xl gap-8 px-4 lg:grid-cols-[1fr_1.1fr] sm:px-6">
        <section className="rounded-3xl bg-gradient-to-br from-sa-blue via-sa-green to-sa-blue p-6 text-white shadow-lg sm:p-8">
          <CalendarDays className="h-9 w-9 text-sa-gold" aria-hidden />
          <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-sa-gold">
            Event advertising
          </p>
          <h1 className="mt-2 text-3xl font-bold">Put your event in front of local customers.</h1>
          <p className="mt-4 leading-relaxed text-white/85">
            Upload your poster, select how long it should appear, and pay online. No account
            required.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/85">
            Every advert is reviewed by our team before it appears on the Events page.
          </p>
          <Link
            href="/events"
            className="mt-6 inline-block text-sm font-semibold text-sa-gold hover:underline"
          >
            ← Back to events
          </Link>
        </section>

        <div>
          {cancelled && (
            <p className="mb-4 rounded-lg border border-sa-gold/40 bg-sa-gold/10 px-4 py-3 text-sm text-slate-700">
              Payment was cancelled. Your advert has not been submitted for review.
            </p>
          )}
          <EventAdvertForm />
        </div>
      </div>
    </main>
  );
}
