"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@/components/layout/sign-out-button";

const NAV_LINKS = [
  { href: "/search", label: "Find Businesses" },
  { href: "/get-quotes", label: "Get 5 Quotes" },
  { href: "/#for-business", label: "For Business" },
  { href: "/events", label: "Events" },
  { href: "/specials", label: "Specials" },
  { href: "/pricing", label: "Pricing" },
] as const;

export function MobileNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const menu = open ? (
    <div className="fixed inset-0 z-[100] xl:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Close menu"
        onClick={() => setOpen(false)}
      />
      <nav
        className="absolute right-0 top-0 flex h-full w-[min(100%,300px)] flex-col bg-white shadow-xl"
        aria-label="Mobile"
      >
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <span className="text-sm font-semibold text-sa-blue">Menu</span>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-sa-green"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 space-y-2 border-t p-4">
          {isLoggedIn ? (
            <>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  Dashboard
                </Link>
              </Button>
              <Button className="w-full bg-sa-blue hover:bg-sa-blue/90" asChild>
                <Link href="/register" onClick={() => setOpen(false)}>
                  Get Leads
                </Link>
              </Button>
              <div className="w-full [&_button]:w-full">
                <SignOutButton />
              </div>
            </>
          ) : (
            <>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login" onClick={() => setOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button className="w-full bg-sa-blue hover:bg-sa-blue/90" asChild>
                <Link href="/register" onClick={() => setOpen(false)}>
                  Get Leads
                </Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </div>
  ) : null;

  return (
    <div className="xl:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {mounted && menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
