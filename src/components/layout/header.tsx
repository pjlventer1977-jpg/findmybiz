import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { MobileNav } from "@/components/layout/mobile-nav";

const NAV_LINKS = [
  { href: "/search", label: "Find Businesses" },
  { href: "/get-quotes", label: "Get 5 Quotes" },
  { href: "/events", label: "Events" },
  { href: "/specials", label: "Specials" },
  { href: "/pricing", label: "Pricing" },
] as const;

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3">
          <Image
            src="/findmybiz-logo-transparent.png"
            alt="FindMyBiz"
            width={140}
            height={42}
            priority
            className="h-9 w-auto object-contain sm:h-11"
          />
          <span className="hidden min-w-0 border-l border-slate-200 pl-3 lg:block">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-sa-blue">
              Find. Connect. Grow.
            </span>
            <span className="block text-[10px] text-muted-foreground">
              South Africa&apos;s Business Directory
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 xl:flex" aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-slate-700 transition-colors hover:text-sa-green"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <MobileNav isLoggedIn={!!user} />
          {user ? (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden rounded-md border-slate-300 sm:inline-flex"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="hidden rounded-md bg-sa-blue px-3 text-sm font-semibold text-white hover:bg-sa-blue/90 sm:inline-flex sm:px-4"
              >
                <Link href="/register">List Your Business</Link>
              </Button>
              <div className="hidden sm:block">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden rounded-md border-slate-300 px-4 text-sm font-semibold sm:inline-flex"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="hidden rounded-md bg-sa-blue px-4 text-sm font-semibold text-white hover:bg-sa-blue/90 sm:inline-flex"
              >
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
