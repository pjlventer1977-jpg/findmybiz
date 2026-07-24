import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Event Advert Submitted",
};

export default function EventListingSuccessPage() {
  return (
    <main className="flex min-h-screen items-center bg-slate-50 px-4 py-12">
      <section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-sa-green" aria-hidden />
        <h1 className="mt-5 text-2xl font-bold text-sa-blue">Payment successful</h1>
        <p className="mt-3 leading-relaxed text-slate-600">
          Your event advert is pending admin approval. It will appear on the Events page once it
          has been reviewed and approved.
        </p>
        <Button className="mt-6 bg-sa-gold text-slate-900 hover:bg-sa-gold/90" asChild>
          <Link href="/events">Browse Events</Link>
        </Button>
      </section>
    </main>
  );
}
