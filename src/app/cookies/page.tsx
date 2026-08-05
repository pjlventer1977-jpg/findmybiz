import Link from "next/link";

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-sm">
      <h1>Cookie Notice</h1>
      <p>Last updated: 5 August 2026</p>
      <p>
        Find My Biz uses cookies and similar technologies so the site can run securely and
        remember your session. This notice explains what we use and why.
      </p>
      <h2>Essential cookies</h2>
      <p>
        We set essential cookies for authentication (Supabase session), security, and core
        site functionality. These are required for login, dashboard access, and protecting
        your account. You cannot opt out of essential cookies if you use the platform.
      </p>
      <h2>Third-party processors</h2>
      <ul>
        <li>
          <strong>Supabase</strong> — authentication and data storage (session cookies)
        </li>
        <li>
          <strong>PayFast</strong> — payment checkout and subscription billing (processed on
          PayFast&apos;s domain when you pay)
        </li>
        <li>
          <strong>Hosting (Vercel)</strong> — delivery and security of the website
        </li>
      </ul>
      <h2>Analytics</h2>
      <p>
        We record product analytics such as profile views and search appearances in our own
        database. We do not currently load third-party advertising trackers.
      </p>
      <h2>Managing cookies</h2>
      <p>
        You can clear or block cookies in your browser settings. Blocking essential cookies
        may prevent you from signing in or completing payments.
      </p>
      <h2>More information</h2>
      <p>
        See our <Link href="/privacy">Privacy Policy</Link> and{" "}
        <Link href="/popia">POPIA</Link> pages, or email privacy@findmybiz.co.za.
      </p>
    </div>
  );
}
