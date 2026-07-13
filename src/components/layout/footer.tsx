import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Linkedin,
  MessageCircle,
  Youtube,
} from "lucide-react";
import { FOOTER_LINKS } from "@/data/homepage";

const SOCIAL_LINKS = [
  { label: "Facebook", icon: Facebook, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "LinkedIn", icon: Linkedin, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
  { label: "WhatsApp", icon: MessageCircle, href: "#" },
] as const;

function AppBadge({ store }: { store: "google" | "apple" }) {
  return (
    <div
      className="flex h-10 min-w-[130px] items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-medium text-white/90"
      aria-hidden
    >
      <span className="text-lg leading-none">{store === "google" ? "▶" : ""}</span>
      <span>
        <span className="block text-[9px] uppercase opacity-70">
          {store === "google" ? "Get it on" : "Download on"}
        </span>
        <span className="block font-semibold">
          {store === "google" ? "Google Play" : "App Store"}
        </span>
      </span>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-sa-green to-sa-blue text-white">
      <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/findmybiz-logo-transparent.png"
                alt="FindMyBiz"
                width={160}
                height={48}
                className="h-12 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-white/90">
              Find. Connect. Grow.
            </p>
            <p className="mt-1 text-xs text-white/75">
              South Africa&apos;s Business Directory
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/80">
              Connecting South African customers with trusted local businesses,
              quotes, specials and events.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <Link
              href="/register"
              className="mt-4 inline-flex rounded-lg bg-sa-gold px-4 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-sa-gold/90"
            >
              Register Your Business
            </Link>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Find Businesses</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {FOOTER_LINKS.find.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Get 5 Quotes</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {FOOTER_LINKS.quotes.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">About</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {FOOTER_LINKS.about.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-sm font-semibold">Support</h4>
            <ul className="space-y-2 text-sm text-white/80">
              {FOOTER_LINKS.support.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="mb-3 mt-5 text-sm font-semibold">Download Our App</h4>
            <div className="flex flex-wrap gap-2">
              <AppBadge store="google" />
              <AppBadge store="apple" />
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-white/15 pt-4 text-sm text-white/75 sm:flex-row sm:items-center">
          <p>&copy; {new Date().getFullYear()} Find My Biz. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/privacy" className="transition-colors hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/terms" className="transition-colors hover:text-white">
              Terms of Service
            </Link>
            <Link href="/popia" className="transition-colors hover:text-white">
              POPIA
            </Link>
          </div>
        </div>
      </div>
      <div className="sa-flag-bar h-1.5 w-full" aria-hidden />
    </footer>
  );
}
