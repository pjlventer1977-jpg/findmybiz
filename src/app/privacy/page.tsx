import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-sm">
      <h1>Privacy Policy</h1>
      <p>Last updated: 5 August 2026</p>
      <p>
        Find My Biz (&quot;we&quot;, &quot;us&quot;) operates findmybiz.co.za. This policy explains how we collect,
        use, and protect your personal information in compliance with the Protection of Personal
        Information Act (POPIA) of South Africa.
      </p>
      <h2>Information We Collect</h2>
      <ul>
        <li>Business registration details (name, contact, address, documents)</li>
        <li>Customer quote request details (name, phone, email, service requirements)</li>
        <li>Usage analytics (profile views, search appearances)</li>
        <li>Payment references processed via PayFast (we do not store full card details)</li>
      </ul>
      <h2>How We Use Your Information</h2>
      <ul>
        <li>To verify and list businesses on our directory</li>
        <li>To route quote requests to matched businesses (with consent)</li>
        <li>To process payments and manage subscriptions</li>
        <li>To improve our platform and services</li>
      </ul>
      <h2>Data Sharing</h2>
      <p>
        Customer contact details are shared with matched businesses only when explicit POPIA
        consent is given during quote requests. We do not sell personal data to third parties.
        Payment processing is handled by PayFast; authentication and storage use Supabase.
      </p>
      <h2>Cookies</h2>
      <p>
        We use essential cookies for authentication and security. See our{" "}
        <Link href="/cookies">Cookie Notice</Link> for details.
      </p>
      <h2>Your Rights</h2>
      <p>
        You have the right to access, correct, or delete your personal information. Contact us
        at privacy@findmybiz.co.za to exercise these rights.
      </p>
      <h2>Contact</h2>
      <p>Email: privacy@findmybiz.co.za</p>
    </div>
  );
}
