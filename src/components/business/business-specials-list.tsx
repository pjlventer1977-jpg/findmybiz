"use client";

import { useState } from "react";
import Image from "next/image";
import { Expand, Gift } from "lucide-react";
import type { Special } from "@/types";
import { Button } from "@/components/ui/button";
import { SpecialImageLightbox } from "./special-image-lightbox";

interface BusinessSpecialsListProps {
  specials: Special[];
}

function expiryLabel(expiryDate: string) {
  return `Valid until ${new Date(expiryDate).toLocaleDateString("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export function BusinessSpecialsList({ specials }: BusinessSpecialsListProps) {
  const [selectedSpecial, setSelectedSpecial] = useState<Special | null>(null);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        {specials.map((special) => {
          const hasImage = Boolean(special.image_url);
          const expiry = expiryLabel(special.expiry_date);

          return (
            <article
              key={special.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-gradient-to-br from-sa-gold/30 via-sa-gold/10 to-sa-red/20">
                {hasImage ? (
                  <button
                    type="button"
                    className="group absolute inset-0 block h-full w-full text-left"
                    onClick={() => setSelectedSpecial(special)}
                    aria-label={`View larger image for ${special.title}`}
                  >
                    <Image
                      src={special.image_url!}
                      alt={special.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <span className="absolute inset-0 flex items-center justify-center bg-slate-950/0 text-sm font-semibold text-white opacity-0 transition-all group-hover:bg-slate-950/35 group-hover:opacity-100">
                      <Expand className="mr-2 h-4 w-4" />
                      View larger
                    </span>
                  </button>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Gift className="h-14 w-14 text-sa-gold" aria-hidden />
                  </div>
                )}
                <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold text-sa-red shadow-sm">
                  {expiry}
                </span>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-sa-blue">{special.title}</h3>
                {special.description && (
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {special.description}
                  </p>
                )}
                <div className="mt-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-slate-500">{expiry}</p>
                  {hasImage && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg px-2 text-xs font-semibold text-sa-green hover:bg-sa-green/5 hover:text-sa-blue"
                      onClick={() => setSelectedSpecial(special)}
                    >
                      <Expand className="mr-1.5 h-3.5 w-3.5" />
                      View larger
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {selectedSpecial?.image_url && (
        <SpecialImageLightbox
          imageUrl={selectedSpecial.image_url}
          title={selectedSpecial.title}
          expiryLabel={expiryLabel(selectedSpecial.expiry_date)}
          onClose={() => setSelectedSpecial(null)}
        />
      )}
    </>
  );
}
