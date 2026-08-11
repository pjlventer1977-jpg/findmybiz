import { Suspense } from "react";
import { getActiveHomeBanners } from "@/lib/queries/ads";
import { AdBannerStrip } from "@/components/ads/ad-banner-strip";

async function HomeBannersContent() {
  const banners = await getActiveHomeBanners(3);
  return <AdBannerStrip banners={banners} label="Sponsored on FindMyBiz" />;
}

export function HomeBannersSectionAsync() {
  return (
    <Suspense fallback={null}>
      <HomeBannersContent />
    </Suspense>
  );
}
