import { SA_PROVINCES } from "@/data/homepage";

/** Approximate province centre positions on a simplified SA wireframe (viewBox 0 0 240 280). */
const PROVINCE_PIN_POSITIONS: Record<string, { x: number; y: number }> = {
  limpopo: { x: 128, y: 38 },
  mpumalanga: { x: 158, y: 78 },
  "north-west": { x: 88, y: 88 },
  gauteng: { x: 108, y: 98 },
  "free-state": { x: 112, y: 128 },
  "northern-cape": { x: 68, y: 148 },
  "kwazulu-natal": { x: 168, y: 148 },
  "eastern-cape": { x: 142, y: 198 },
  "western-cape": { x: 58, y: 228 },
};

export function SaProvinceMap({ className }: { className?: string }) {
  return (
    <div className={className}>
      <svg
        viewBox="0 0 240 280"
        className="h-full w-full"
        role="img"
        aria-label="Wireframe map of South Africa showing all 9 provinces"
      >
        <defs>
          <pattern
            id="sa-grid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.4"
              className="text-sa-green/15"
            />
          </pattern>
        </defs>

        {/* Wireframe grid */}
        <rect
          x="28"
          y="18"
          width="175"
          height="235"
          fill="url(#sa-grid)"
          rx="4"
        />

        {/* Simplified South Africa outline */}
        <path
          d="M 72 24
             L 118 20 L 158 28 L 182 48 L 192 72
             L 188 98 L 178 118 L 182 142 L 172 168
             L 158 188 L 148 210 L 128 232 L 98 248
             L 68 252 L 48 238 L 38 212 L 42 182
             L 36 152 L 40 122 L 48 92 L 58 62
             L 64 40 Z"
          fill="hsl(152 100% 24% / 0.06)"
          stroke="#007A4D"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Internal wireframe province divisions (decorative) */}
        <path
          d="M 72 24 L 64 40 L 58 62 M 118 20 L 108 98 M 158 28 L 168 148
             M 98 248 L 112 128 M 148 210 L 112 128 M 68 252 L 68 148
             M 182 142 L 112 128 M 48 238 L 88 88 M 178 118 L 108 98"
          fill="none"
          stroke="#007A4D"
          strokeWidth="0.6"
          strokeDasharray="4 3"
          opacity="0.45"
        />

        {/* Province pins */}
        {SA_PROVINCES.map((province) => {
          const pos = PROVINCE_PIN_POSITIONS[province.slug];
          if (!pos) return null;
          return (
            <g key={province.slug}>
              <circle
                cx={pos.x}
                cy={pos.y}
                r="9"
                fill="#007A4D"
                opacity="0.15"
              />
              <circle cx={pos.x} cy={pos.y} r="5.5" fill="#007A4D" />
              <circle cx={pos.x} cy={pos.y - 1.5} r="1.2" fill="white" />
              <title>{province.name}</title>
            </g>
          );
        })}
      </svg>

      <p className="mt-3 text-center text-xs font-medium text-muted-foreground lg:text-left">
        Businesses across all 9 provinces
      </p>
    </div>
  );
}
