import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Bell, Check, Mail, MapPin, Phone, User, Wrench } from "lucide-react";
import { HeroSearch } from "@/components/home/hero-search";
import { SectionShell } from "@/components/home/section-shell";
import { Button } from "@/components/ui/button";
import { HERO_BACKGROUND_IMAGE, POPULAR_SEARCHES } from "@/data/homepage";

const OWNER_BULLETS = [
  "Leads delivered to your business email",
  "Get 5 Quotes customer requests",
  "Manage leads in your dashboard",
] as const;

function HeroLeadMockup() {
  return (
    <div className="hidden sm:block" aria-hidden>
      <div className="overflow-hidden rounded-xl border border-sa-gold/25 bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-sa-gold/20 bg-sa-blue px-3 py-2 text-white">
          <Mail className="h-3.5 w-3.5 text-sa-gold" />
          <span className="text-xs font-semibold">New Lead — FindMyBiz</span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-sa-gold/20 px-2 py-0.5 text-[9px] font-medium text-sa-gold">
            <Bell className="h-2.5 w-2.5" />
            Just now
          </span>
        </div>
        <div className="space-y-2 p-3">
          <div className="space-y-1.5 rounded-lg border border-slate-100 bg-slate-50/90 p-2.5">
            <div className="flex items-center gap-1.5 text-xs">
              <User className="h-3.5 w-3.5 shrink-0 text-sa-green" />
              <span className="font-medium text-slate-800">Thabo M.</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <Wrench className="h-3.5 w-3.5 shrink-0 text-sa-green" />
              <span>Plumbing repair — burst pipe</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-sa-green" />
              <span>Sandton, Gauteng</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
              <Phone className="h-3.5 w-3.5 shrink-0 text-sa-green" />
              <span>082 555 1234</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeroBusinessPanel() {
  return (
    <div className="rounded-2xl border-2 border-sa-gold/60 bg-white/92 p-4 shadow-lg backdrop-blur-md sm:p-5 lg:p-6">
      <span className="inline-flex rounded-full border border-sa-gold/40 bg-sa-gold/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sa-blue sm:text-xs">
        For Business Owners
      </span>

      <h2 className="mt-3 text-lg font-bold leading-tight text-sa-blue sm:text-xl lg:text-2xl">
        Get Customer Leads in Your Inbox
      </h2>

      <p className="mt-2 text-xs leading-relaxed text-slate-600 sm:text-sm">
        When customers use Get 5 Quotes, qualified enquiries are routed to your
        business by email and in your dashboard.
      </p>

      <ul className="mt-3 space-y-1.5 sm:mt-4">
        {OWNER_BULLETS.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-slate-700 sm:text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-sa-green" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4">
        <HeroLeadMockup />
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:flex-row sm:flex-wrap">
        <Button
          size="sm"
          className="h-10 rounded-lg bg-sa-gold px-4 text-sm font-semibold text-slate-900 shadow-sm hover:bg-sa-gold/90 sm:h-11 sm:flex-1"
          asChild
        >
          <Link href="/register">
            Register &amp; Receive Leads
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Link>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-10 text-sm font-semibold text-sa-blue hover:bg-sa-blue/5 sm:h-11"
          asChild
        >
          <Link href="/pricing">View pricing</Link>
        </Button>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="relative min-h-[480px] overflow-hidden border-b border-slate-200 lg:min-h-[560px]">
      <Image
        src={HERO_BACKGROUND_IMAGE}
        alt=""
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />

      {/* Upper-left readability wash — leaves bottom-left branding visible */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.95)_0%,rgba(255,255,255,0.88)_38%,rgba(255,255,255,0.55)_58%,rgba(255,255,255,0.2)_72%,transparent_88%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.35)_0%,transparent_28%,transparent_62%,rgba(15,23,42,0.08)_100%)]"
        aria-hidden
      />

      <SectionShell className="relative flex min-h-[480px] flex-col justify-start py-6 sm:py-8 lg:min-h-[560px] lg:justify-center lg:py-10">
        <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:gap-8 xl:gap-10">
          <div className="order-2 lg:order-1">
            <div className="text-center lg:text-left">
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-sa-blue sm:text-3xl lg:text-[2.75rem]">
                Find the Best Businesses{" "}
                <span className="text-sa-green">Near You</span>
              </h1>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 sm:mt-3 sm:text-base lg:mx-0">
                Discover trusted businesses, compare quotes, browse specials and connect
                with local professionals across South Africa.
              </p>

              <div className="mx-auto mt-4 max-w-2xl sm:mt-6 lg:mx-0">
                <HeroSearch />
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:mt-4 lg:justify-start">
                <span className="text-xs font-medium text-slate-600">Popular:</span>
                {POPULAR_SEARCHES.map(({ label, query }) => (
                  <Link
                    key={label}
                    href={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
                    className="rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm backdrop-blur-sm transition-colors hover:border-sa-green hover:text-sa-green"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <HeroBusinessPanel />
          </div>
        </div>
      </SectionShell>
    </section>
  );
}
