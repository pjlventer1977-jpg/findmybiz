"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpecialImageLightboxProps {
  imageUrl: string;
  title: string;
  expiryLabel: string;
  onClose: () => void;
}

export function SpecialImageLightbox({
  imageUrl,
  title,
  expiryLabel,
  onClose,
}: SpecialImageLightboxProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} image preview`}
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute right-3 top-3 z-10 h-9 w-9 rounded-full shadow-sm"
          onClick={onClose}
          aria-label="Close enlarged image"
        >
          <X className="h-4 w-4" />
        </Button>
        <div className="relative min-h-0 flex-1 bg-slate-950">
          <Image
            src={imageUrl}
            alt={title}
            width={1600}
            height={1200}
            className="max-h-[76vh] w-full object-contain"
            unoptimized
          />
        </div>
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="font-semibold text-sa-blue">{title}</p>
          <p className="mt-1 text-sm text-slate-600">{expiryLabel}</p>
          <p className="mt-2 text-xs text-slate-500">Click outside to close</p>
        </div>
      </div>
    </div>
  );
}
