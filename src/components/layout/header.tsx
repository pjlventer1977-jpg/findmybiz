import Link from "next/link";
import { Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm">
            FMB
          </div>
          <div>
            <span className="font-bold text-lg text-primary">Find My Biz</span>
            <span className="hidden sm:block text-xs text-muted-foreground">
              South Africa
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/search" className="text-sm font-medium hover:text-primary">
            Find Businesses
          </Link>
          <Link href="/get-quotes" className="text-sm font-medium hover:text-primary">
            Get 5 Quotes
          </Link>
          <Link href="/specials" className="text-sm font-medium hover:text-primary">
            Specials
          </Link>
          <Link href="/events" className="text-sm font-medium hover:text-primary">
            Events
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="sm" asChild className="hidden sm:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">List Your Business</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function HeroSearch() {
  return (
    <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-2 w-full max-w-2xl">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          name="q"
          type="search"
          placeholder="Business name, category, or service..."
          className="w-full h-12 pl-10 pr-4 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <Button type="submit" size="lg" className="h-12 px-8">
        Search Businesses
      </Button>
    </form>
  );
}
