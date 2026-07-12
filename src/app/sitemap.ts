import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://findmybiz.co.za";

const PROVINCES = [
  "gauteng", "western-cape", "kwazulu-natal", "eastern-cape",
  "northern-cape", "free-state", "limpopo", "mpumalanga", "north-west",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/get-quotes`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/specials`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/events`, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/pricing`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/register`, changeFrequency: "monthly", priority: 0.7 },
    ...PROVINCES.map((p) => ({
      url: `${BASE_URL}/${p}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  return staticPages;
}
