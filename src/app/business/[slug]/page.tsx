import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Globe, MapPin, MessageCircle, FileText } from "lucide-react";
import { getBusinessBySlug } from "@/lib/queries/public";
import { TrustBadge } from "@/components/business/business-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildWhatsAppLink } from "@/lib/utils";
import { ProfileViewTracker } from "@/components/analytics/profile-view-tracker";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return { title: "Business Not Found" };

  return {
    title: business.name,
    description: business.description ?? `${business.name} — verified business on Find My Biz`,
    openGraph: {
      title: business.name,
      description: business.description ?? undefined,
      images: business.logo_url ? [business.logo_url] : [],
    },
  };
}

export default async function BusinessProfilePage({ params }: PageProps) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const whatsappLink = business.whatsapp
    ? buildWhatsAppLink(
        business.whatsapp,
        `Hi ${business.name}, I found you on Find My Biz and would like to enquire about your services.`
      )
    : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description,
    telephone: business.phone,
    email: business.email,
    url: business.website,
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address,
      addressLocality: business.city?.name,
      addressRegion: business.province?.name,
      addressCountry: "ZA",
    },
    image: business.logo_url,
  };

  return (
    <>
      <ProfileViewTracker businessId={business.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-6 items-start">
              <div className="h-24 w-24 shrink-0 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
                {business.logo_url ? (
                  <Image
                    src={business.logo_url}
                    alt={business.name}
                    width={96}
                    height={96}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-3xl font-bold text-primary">
                    {business.name.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{business.name}</h1>
                {business.trading_name && (
                  <p className="text-muted-foreground">Trading as: {business.trading_name}</p>
                )}
                <div className="mt-2">
                  <TrustBadge score={business.biz_trust_score} />
                </div>
                {business.is_verified && (
                  <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                    Verified Business
                  </span>
                )}
              </div>
            </div>

            {business.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{business.description}</p>
                </CardContent>
              </Card>
            )}

            {business.categories && business.categories.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Services & Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {business.categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/search?category=${cat.slug}`}
                        className="px-3 py-1 rounded-full bg-muted text-sm hover:bg-primary/10"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {business.contact_person && (
                  <p className="text-sm">
                    <span className="font-medium">Contact:</span> {business.contact_person}
                  </p>
                )}
                <a href={`tel:${business.phone}`} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Phone className="h-4 w-4" /> {business.phone}
                </a>
                <a href={`mailto:${business.email}`} className="flex items-center gap-2 text-sm hover:text-primary">
                  <Mail className="h-4 w-4" /> {business.email}
                </a>
                {business.website && (
                  <a href={business.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm hover:text-primary">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
                {business.address && (
                  <p className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                    {business.address}
                    {business.city && `, ${business.city.name}`}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <a href={`tel:${business.phone}`}>
                  <Phone className="h-4 w-4 mr-2" /> Call Now
                </a>
              </Button>
              {whatsappLink && (
                <Button variant="outline" asChild className="w-full">
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                  </a>
                </Button>
              )}
              <Button variant="secondary" asChild className="w-full">
                <Link href={`/get-quotes?business=${business.slug}`}>
                  <FileText className="h-4 w-4 mr-2" /> Request Quote
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
