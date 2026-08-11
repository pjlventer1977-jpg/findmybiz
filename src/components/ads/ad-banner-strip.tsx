import Image from "next/image";
import Link from "next/link";
import type { BannerAd } from "@/lib/queries/ads";

interface AdBannerStripProps {
  banners: BannerAd[];
  label?: string;
}

export function AdBannerStrip({ banners, label = "Sponsored" }: AdBannerStripProps) {
  if (banners.length === 0) return null;

  return (
    <section className="border-y border-slate-100 bg-white py-4">
      <div className="container mx-auto px-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {banners.map((banner) => {
            const content = (
              <div className="relative aspect-[3/1] overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm">
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            );

            return banner.link_url ? (
              <Link
                key={banner.id}
                href={banner.link_url}
                className="block transition-transform hover:-translate-y-0.5"
              >
                {content}
              </Link>
            ) : (
              <div key={banner.id}>{content}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
