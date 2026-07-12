import Link from "next/link";

const PROVINCES = [
  { name: "Gauteng", slug: "gauteng" },
  { name: "Western Cape", slug: "western-cape" },
  { name: "KwaZulu-Natal", slug: "kwazulu-natal" },
  { name: "Eastern Cape", slug: "eastern-cape" },
  { name: "Northern Cape", slug: "northern-cape" },
  { name: "Free State", slug: "free-state" },
  { name: "Limpopo", slug: "limpopo" },
  { name: "Mpumalanga", slug: "mpumalanga" },
  { name: "North West", slug: "north-west" },
];

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg text-primary mb-3">Find My Biz</h3>
            <p className="text-sm text-muted-foreground">
              South Africa&apos;s trusted business directory. Get found. Get verified. Get leads.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">For Customers</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/search" className="hover:text-primary">Find Businesses</Link></li>
              <li><Link href="/get-quotes" className="hover:text-primary">Get 5 Quotes</Link></li>
              <li><Link href="/specials" className="hover:text-primary">Browse Specials</Link></li>
              <li><Link href="/events" className="hover:text-primary">Browse Events</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">For Businesses</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/register" className="hover:text-primary">List Your Business</Link></li>
              <li><Link href="/pricing" className="hover:text-primary">Pricing Plans</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary">Business Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Provinces</h4>
            <ul className="space-y-1 text-sm grid grid-cols-2 gap-x-4">
              {PROVINCES.map((p) => (
                <li key={p.slug}>
                  <Link href={`/${p.slug}`} className="hover:text-primary">
                    {p.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t flex flex-col sm:flex-row justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Find My Biz. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-primary">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-primary">Terms of Service</Link>
            <Link href="/popia" className="hover:text-primary">POPIA Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
