export default function PopiaPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-sm">
      <h1>POPIA Compliance</h1>
      <p>
        Find My Biz is committed to compliance with the Protection of Personal Information Act
        (POPIA), Act 4 of 2013, of South Africa.
      </p>
      <h2>Information Officer</h2>
      <p>
        Contact our Information Officer at: privacy@findmybiz.co.za
      </p>
      <h2>Lawful Processing</h2>
      <p>We process personal information based on:</p>
      <ul>
        <li>Consent (quote requests with explicit POPIA checkbox)</li>
        <li>Contractual necessity (business subscriptions)</li>
        <li>Legitimate interest (platform security and analytics)</li>
      </ul>
      <h2>Data Subject Rights</h2>
      <ul>
        <li>Right to access your personal information</li>
        <li>Right to correction of inaccurate data</li>
        <li>Right to deletion (subject to legal retention requirements)</li>
        <li>Right to object to processing</li>
        <li>Right to lodge a complaint with the Information Regulator</li>
      </ul>
      <h2>Lead Data Handling</h2>
      <p>
        When customers submit quote requests, they explicitly consent to their contact details
        being shared with matched businesses. Businesses must use this data solely for responding
        to the enquiry and must not add contacts to marketing lists without separate consent.
      </p>
      <h2>Data Retention</h2>
      <ul>
        <li>Quote requests: retained for 24 months</li>
        <li>Business documents: retained while listing is active + 12 months</li>
        <li>Payment records: retained for 5 years (tax compliance)</li>
      </ul>
      <h2>Information Regulator</h2>
      <p>
        Website: <a href="https://www.justice.gov.za/inforeg/">www.justice.gov.za/inforeg</a>
      </p>
    </div>
  );
}
