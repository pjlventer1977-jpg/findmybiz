import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  name: string;
  location: string;
  quote: string;
  className?: string;
}

export function TestimonialCard({
  name,
  location,
  quote,
  className,
}: TestimonialCardProps) {
  return (
    <article
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sa-green/10 text-sm font-bold text-sa-green">
          {name.charAt(0)}
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">{name}</p>
          <p className="text-xs text-muted-foreground">{location}</p>
        </div>
      </div>
      <div className="mt-3 flex text-amber-400" aria-label="5 star rating">
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className="h-3.5 w-3.5 fill-current" />
        ))}
      </div>
      <p className="mt-3 text-sm italic leading-relaxed text-muted-foreground">
        &ldquo;{quote}&rdquo;
      </p>
    </article>
  );
}
