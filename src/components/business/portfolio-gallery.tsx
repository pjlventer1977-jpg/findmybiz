"use client";

import { useState } from "react";
import Image from "next/image";
import { SpecialImageLightbox } from "@/components/business/special-image-lightbox";

export interface PortfolioGalleryItem {
  id: string;
  image_url: string;
  caption: string | null;
}

interface PortfolioGalleryProps {
  items: PortfolioGalleryItem[];
}

export function PortfolioGallery({ items }: PortfolioGalleryProps) {
  const [activeItem, setActiveItem] = useState<PortfolioGalleryItem | null>(null);

  if (items.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className="group relative aspect-square overflow-hidden rounded-xl border bg-muted text-left"
            onClick={() => setActiveItem(item)}
          >
            <Image
              src={item.image_url}
              alt={item.caption ?? "Portfolio image"}
              fill
              sizes="(min-width: 640px) 33vw, 50vw"
              className="object-cover transition-transform group-hover:scale-105"
              unoptimized
            />
            {item.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 py-2 text-xs text-white line-clamp-2">
                {item.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeItem && (
        <SpecialImageLightbox
          imageUrl={activeItem.image_url}
          title={activeItem.caption ?? "Portfolio"}
          expiryLabel={activeItem.caption ?? "Past work showcase"}
          onClose={() => setActiveItem(null)}
        />
      )}
    </>
  );
}
