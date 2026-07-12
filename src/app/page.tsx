import Link from "next/link";
import {
  Search,
  FileText,
  Calendar,
  Tag,
  Star,
  Shield,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeroSearch } from "@/components/layout/header";
import { BusinessCard } from "@/components/business/business-card";
import {
  getFeaturedBusinesses,
  getLatestSpecials,
  getUpcomingEvents,
  getPopularCategories,
} from "@/lib/queries/public";
import { formatCurrency } from "@/lib/utils";
import { MEMBERSHIP_PLANS } from "@/constants/membership";

export default async function HomePage() {
  const [featured, specials, events, categories] = await Promise.all([
    getFeaturedBusinesses(),
    getLatestSpecials(),
    getUpcomingEvents(),
    getPopularCategories(),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-white to-sa-gold/10 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            Find Trusted Businesses
            <span className="block text-primary">Across South Africa</span>
          </h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Search businesses, request 5 quotes, discover events and local specials.
            Covering all 9 provinces and every major city.
          </p>
          <HeroSearch />

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {[
              { href: "/search", label: "Find Businesses", icon: Search },
              { href: "/get-quotes", label: "Get 5 Quotes", icon: FileText },
              { href: "/events", label: "Browse Events", icon: Calendar },
              { href: "/specials", label: "View Specials", icon: Tag },
            ].map(({ href, label, icon: Icon }) => (
              <Button key={href} variant="outline" asChild>
                <Link href={href}>
                  <Icon className="h-4 w-4 mr-2" />
                  {label}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "BizTrust Verified",
                desc: "Every business verified with documents and a trust score from 0–100.",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp Lead Cards",
                desc: "Businesses receive leads instantly via WhatsApp — SA's #1 channel.",
              },
              {
                icon: Star,
                title: "Get 5 Quotes",
                desc: "Customers request quotes and we route to up to 5 verified businesses.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title}>
                <CardContent className="pt-6 text-center">
                  <Icon className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      {featured.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Featured Businesses</h2>
              <Button variant="link" asChild>
                <Link href="/search">View all</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Popular Categories */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Popular Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/search?category=${cat.slug}`}
                className="p-4 rounded-lg border bg-white hover:border-primary hover:shadow-sm transition-all text-center"
              >
                <span className="text-sm font-medium">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Specials */}
      {specials.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Latest Specials</h2>
              <Button variant="link" asChild>
                <Link href="/specials">View all</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {specials.map((special) => (
                <Card key={special.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{special.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {special.description}
                    </p>
                    {special.business && (
                      <Link
                        href={`/business/${special.business.slug}`}
                        className="text-sm text-primary mt-2 inline-block hover:underline"
                      >
                        {special.business.name}
                      </Link>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Upcoming Events</h2>
              <Button variant="link" asChild>
                <Link href="/events">View all</Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <Card key={event.id}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold">{event.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(event.event_date).toLocaleDateString("en-ZA", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {event.venue && (
                      <p className="text-sm mt-1">{event.venue}</p>
                    )}
                    <Link
                      href={`/events/${event.slug}`}
                      className="text-sm text-primary mt-2 inline-block hover:underline"
                    >
                      View details
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing CTA */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">List Your Business Today</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of South African businesses. Get verified, receive leads, and grow your customer base.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
            {MEMBERSHIP_PLANS.map((plan) => (
              <div key={plan.tier} className="bg-white/10 rounded-lg p-4">
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-2xl font-bold mt-1">
                  {plan.price === 0 ? "Free" : formatCurrency(plan.price)}
                  {plan.price > 0 && <span className="text-sm font-normal">/mo</span>}
                </p>
              </div>
            ))}
          </div>
          <Button size="lg" variant="accent" asChild>
            <Link href="/register">Get Started Free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}
