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

export function Footer() {
  return (
    <footer className="bg-gradient-to-br from-sa-green to-sa-blue text-white">
      <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6 sm:py-7">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))] lg:gap-5">
          <div>
            <Link href="/" className="inline-flex items-center">
              <Image
                src="/findmybiz-logo-transparent.png"
                alt="FindMyBiz"
                width={160}
                height={48}
                className="h-10 w-auto object-contain brightness-0 invert"
              />
            </Link>
            <p className="mt-1.5 text-[10px] font-bold uppercase tracking-wider text-white/90">
              Find. Connect. Grow.
            </p>
            <p className="text-xs text-white/75">South Africa&apos;s Business Directory</p>
            <p className="mt-2 max-w-xs text-sm leading-snug text-white/80">
              Connecting South African customers with trusted local businesses,
              quotes, specials and events.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SOCIAL_LINKS.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20"
                >
                  <Icon className="h-3.5 w-3.5" />
                </a>
              ))}
            </div>
            <Link
              href="/register"
              className="mt-3 inline-flex rounded-lg bg-sa-gold px-4 py-1.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-sa-gold/90"
            >
              Register Your Business
            </Link>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Find Businesses</h4>
            <ul className="space-y-1.5 text-sm text-white/80">
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
            <h4 className="mb-2 text-sm font-semibold">Get 5 Quotes</h4>
            <ul className="space-y-1.5 text-sm text-white/80">
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
            <h4 className="mb-2 text-sm font-semibold">About</h4>
            <ul className="space-y-1.5 text-sm text-white/80">
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
            <h4 className="mb-2 text-sm font-semibold">Support</h4>
            <ul className="space-y-1.5 text-sm text-white/80">
              {FOOTER_LINKS.support.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="transition-colors hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-2 border-t border-white/15 pt-3 text-xs text-white/75 sm:flex-row sm:items-center sm:text-sm">
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
      <div className="sa-flag-bar h-1 w-full" aria-hidden />
    </footer>
  );
}
