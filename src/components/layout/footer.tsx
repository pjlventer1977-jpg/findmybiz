import Link from "next/link";
import Image from "next/image";
import { FOOTER_LINKS } from "@/data/homepage";

function FooterNavLink({ label, href }: { label: string; href: string }) {
  const external = href.startsWith("mailto:") || href.startsWith("http");
  if (external) {
    return (
      <a href={href} className="transition-colors hover:text-white">
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className="transition-colors hover:text-white">
      {label}
    </Link>
  );
}

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
            <p className="mt-3 text-sm text-white/80">
              Support:{" "}
              <a
                href="mailto:support@findmybiz.co.za"
                className="underline decoration-white/40 underline-offset-2 hover:text-white"
              >
                support@findmybiz.co.za
              </a>
            </p>
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
                  <FooterNavLink label={label} href={href} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Get 5 Quotes</h4>
            <ul className="space-y-1.5 text-sm text-white/80">
              {FOOTER_LINKS.quotes.map(({ label, href }) => (
                <li key={label}>
                  <FooterNavLink label={label} href={href} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">About</h4>
            <ul className="space-y-1.5 text-sm text-white/80">
              {FOOTER_LINKS.about.map(({ label, href }) => (
                <li key={label}>
                  <FooterNavLink label={label} href={href} />
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold">Support</h4>
            <ul className="space-y-1.5 text-sm text-white/80">
              {FOOTER_LINKS.support.map(({ label, href }) => (
                <li key={label}>
                  <FooterNavLink label={label} href={href} />
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
            <Link href="/cookies" className="transition-colors hover:text-white">
              Cookies
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
