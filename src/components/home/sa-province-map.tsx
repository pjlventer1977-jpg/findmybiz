"use client";

import Image from "next/image";
import { useState } from "react";
import { SA_PROVINCE_PATHS } from "@/data/sa-province-paths";
import { cn } from "@/lib/utils";

interface SaProvinceMapProps {
  className?: string;
  activeSlug?: string | null;
  onProvinceHover?: (slug: string | null) => void;
}

export function SaProvinceMap({
  className,
  activeSlug,
  onProvinceHover,
}: SaProvinceMapProps) {
  const [localHover, setLocalHover] = useState<string | null>(null);
  const hoveredSlug = activeSlug ?? localHover;
  const hoveredProvince = SA_PROVINCE_PATHS.find((p) => p.slug === hoveredSlug);

  function setHover(slug: string | null) {
    setLocalHover(slug);
    onProvinceHover?.(slug);
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative mx-auto aspect-[1024/682] w-full max-w-2xl">
        <Image
          src="/sa-provinces-map.png"
          alt="Map of South Africa showing all nine provinces"
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 640px"
          priority={false}
        />

        <svg
          viewBox="0 0 1024 682"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Interactive South Africa province map"
        >
          {SA_PROVINCE_PATHS.map((province) => {
            const isActive = hoveredSlug === province.slug;
            return (
              <a
                key={province.slug}
                href={`/${province.slug}`}
                className="outline-none"
                onMouseEnter={() => setHover(province.slug)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(province.slug)}
                onBlur={() => setHover(null)}
              >
                <path
                  d={province.d}
                  fill={isActive ? "rgba(0, 122, 77, 0.42)" : "rgba(0, 122, 77, 0)"}
                  stroke={isActive ? "#007A4D" : "rgba(0, 122, 77, 0)"}
                  strokeWidth={isActive ? 2.5 : 0}
                  className="cursor-pointer transition-all duration-200 ease-out"
                  fillRule="evenodd"
                >
                  <title>{province.name}</title>
                </path>
              </a>
            );
          })}
        </svg>

        {hoveredProvince && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-sa-blue px-3 py-1.5 text-xs font-semibold text-white shadow-md">
            {hoveredProvince.name}
          </div>
        )}
      </div>

      <p className="mt-3 text-center text-xs font-medium text-muted-foreground lg:text-left">
        Hover a province to explore — businesses across all 9 provinces
      </p>
    </div>
  );
}
