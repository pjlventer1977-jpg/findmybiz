export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-sm">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString("en-ZA")}</p>
      <p>
        By using Find My Biz (findmybiz.co.za), you agree to these terms. Please read them carefully.
      </p>
      <h2>For Businesses</h2>
      <ul>
        <li>You must provide accurate business information and valid verification documents</li>
        <li>Membership fees are billed monthly via PayFast</li>
        <li>Lead credits are allocated per plan and expire after 12 months for purchased packs</li>
        <li>We reserve the right to suspend listings that violate our policies</li>
      </ul>
      <h2>For Customers</h2>
      <ul>
        <li>Quote requests are free and routed to up to 5 verified businesses</li>
        <li>You consent to sharing your contact details with matched businesses</li>
        <li>Find My Biz is not responsible for the quality of services provided by listed businesses</li>
      </ul>
      <h2>Limitation of Liability</h2>
      <p>
        Find My Biz provides a directory and lead routing service. We do not guarantee business
        outcomes, lead conversion, or service quality from listed businesses.
      </p>
      <h2>Contact</h2>
      <p>Email: support@findmybiz.co.za</p>
    </div>
  );
}
