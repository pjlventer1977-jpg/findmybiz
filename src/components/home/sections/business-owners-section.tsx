import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Mail,
  MapPin,
  Phone,
  User,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionShell } from "@/components/home/section-shell";
import { BUSINESS_OWNER_BENEFITS } from "@/data/homepage";

function LeadInboxMockup() {
  return (
    <div
      className="relative mx-auto w-full max-w-md lg:mx-0 lg:max-w-none"
      aria-hidden
    >
      <div className="absolute -left-3 -top-3 h-full w-full rounded-2xl bg-sa-gold/20" />
      <Card className="relative overflow-hidden rounded-2xl border-sa-gold/30 shadow-lg">
        <div className="flex items-center gap-2 border-b bg-sa-blue px-4 py-3 text-white">
          <Mail className="h-4 w-4 text-sa-gold" />
          <span className="text-sm font-semibold">New Lead — FindMyBiz</span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-sa-gold/20 px-2 py-0.5 text-[10px] font-medium text-sa-gold">
            <Bell className="h-3 w-3" />
            Just now
          </span>
        </div>
        <CardContent className="space-y-3 p-4">
          <p className="text-xs text-muted-foreground">
            Routed by QuoteMatch to your business listing email
          </p>
          <div className="space-y-2.5 rounded-xl border border-slate-100 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 shrink-0 text-sa-green" />
              <span className="font-medium text-slate-800">Thabo M.</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Wrench className="h-4 w-4 shrink-0 text-sa-green" />
              <span>Plumbing repair — burst pipe</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-sa-green" />
              <span>Sandton, Gauteng</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4 shrink-0 text-sa-green" />
              <span>082 555 1234</span>
            </div>
          </div>
          <p className="text-center text-[11px] text-muted-foreground">
            Also visible in Dashboard → Leads
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export function BusinessOwnersSection() {
  return (
    <section
      id="for-business"
      className="relative overflow-hidden border-y border-slate-200 bg-gradient-to-br from-slate-50 via-white to-sa-green/5 py-12 sm:py-16"
    >
      <div
        className="pointer-events-none absolute -right-24 top-0 h-64 w-64 rounded-full bg-sa-gold/10 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 bottom-0 h-64 w-64 rounded-full bg-sa-blue/5 blur-3xl"
        aria-hidden
      />

      <SectionShell className="relative">
        <p className="mb-3 text-center text-xs font-bold uppercase tracking-widest text-sa-green sm:text-left">
          For Business Owners
        </p>

        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="text-center sm:text-left">
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-sa-blue sm:text-4xl lg:text-5xl">
              Get Customer Leads{" "}
              <span className="text-sa-gold">Delivered to Your Inbox</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:mx-0 sm:text-lg">
              When customers request quotes on FindMyBiz, qualified enquiries are
              routed to your business — to your email and your dashboard.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-start sm:gap-4">
              <Button
                size="lg"
                className="h-12 rounded-lg bg-sa-gold px-6 text-sm font-semibold text-slate-900 shadow-md hover:bg-sa-gold/90"
                asChild
              >
                <Link href="/register">
                  Register &amp; Start Receiving Leads
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-lg border-sa-blue px-6 text-sm font-semibold text-sa-blue hover:bg-sa-blue/5"
                asChild
              >
                <Link href="/pricing">View Pricing Plans</Link>
              </Button>
            </div>

            <p className="mt-4 text-xs text-muted-foreground">
              Proudly South African — helping local businesses grow nationwide.
            </p>
          </div>

          <LeadInboxMockup />
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BUSINESS_OWNER_BENEFITS.map(
            ({ icon: Icon, title, description, featured }) => (
              <Card
                key={title}
                className={
                  featured
                    ? "rounded-2xl border-2 border-sa-gold/40 bg-gradient-to-br from-sa-gold/5 to-white shadow-md sm:col-span-2 lg:col-span-1"
                    : "rounded-2xl border-slate-100 shadow-sm transition-shadow hover:shadow-md"
                }
              >
                <CardContent className="flex gap-4 p-5">
                  <span
                    className={
                      featured
                        ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sa-gold/20 text-sa-gold"
                        : "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sa-green/10 text-sa-green"
                    }
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {title}
                      {featured && (
                        <span className="ml-2 inline-block rounded-full bg-sa-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-sa-gold">
                          Core
                        </span>
                      )}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                      {description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </SectionShell>
    </section>
  );
}
