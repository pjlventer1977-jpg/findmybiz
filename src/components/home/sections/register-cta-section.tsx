import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionShell } from "@/components/home/section-shell";

export function RegisterCtaSection() {
  return (
    <section className="bg-gradient-to-br from-sa-blue to-sa-green py-10 text-white sm:py-12">
      <SectionShell>
        <div className="grid items-center gap-5 rounded-2xl border border-white/15 bg-white/10 p-6 sm:p-8 md:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready to grow your business?
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-white/90 sm:text-base">
              Register your business on FindMyBiz, get verified, and start receiving
              enquiries from customers across South Africa.
            </p>
          </div>
          <Button
            size="lg"
            className="h-11 shrink-0 rounded-lg bg-sa-gold px-6 text-sm font-semibold text-slate-900 hover:bg-sa-gold/90"
            asChild
          >
            <Link href="/register">
              Register Your Business
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </SectionShell>
    </section>
  );
}
