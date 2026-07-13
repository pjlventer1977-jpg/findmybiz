import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SLUG_MAP = {
  "Northern Cape": "northern-cape",
  "Western Cape": "western-cape",
  "Eastern Cape": "eastern-cape",
  "Free State": "free-state",
  "KwaZulu-Natal": "kwazulu-natal",
  Limpopo: "limpopo",
  Mpumalanga: "mpumalanga",
  Gauteng: "gauteng",
  "North West": "north-west",
};

// Content bounds of non-white pixels in sa-provinces-map.png
const MAP = { x: 34, y: 9, w: 758, h: 648 };
const MIN_LON = 16.3;
const MAX_LON = 33.0;
const MIN_LAT = -34.9;
const MAX_LAT = -22.0;

function project(lon, lat) {
  const x = MAP.x + ((lon - MIN_LON) / (MAX_LON - MIN_LON)) * MAP.w;
  const y = MAP.y + ((MAX_LAT - lat) / (MAX_LAT - MIN_LAT)) * MAP.h;
  return [Math.round(x * 10) / 10, Math.round(y * 10) / 10];
}

function isValidPoint([x, y]) {
  return x >= MAP.x - 5 && x <= MAP.x + MAP.w + 5 && y >= MAP.y - 5 && y <= MAP.y + MAP.h + 5;
}

function simplifyRing(ring, minDist = 1.2) {
  const projected = ring.map(([lon, lat]) => project(lon, lat)).filter(isValidPoint);
  if (projected.length < 3) return [];
  const out = [projected[0]];
  for (let i = 1; i < projected.length; i++) {
    const [x1, y1] = out[out.length - 1];
    const [x2, y2] = projected[i];
    const dx = x2 - x1;
    const dy = y2 - y1;
    if (dx * dx + dy * dy >= minDist * minDist) {
      out.push(projected[i]);
    }
  }
  const [fx, fy] = projected[0];
  const [lx, ly] = out[out.length - 1];
  if (fx !== lx || fy !== ly) out.push(projected[0]);
  return out.length >= 3 ? out : [];
}

function ringToPath(ring) {
  const pts = simplifyRing(ring);
  if (!pts.length) return "";
  const [fx, fy] = pts[0];
  let d = `M ${fx},${fy}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${pts[i][0]},${pts[i][1]}`;
  }
  return `${d} Z`;
}

function geometryToPath(geometry) {
  const { type, coordinates } = geometry;
  if (type === "Polygon") {
    return coordinates.map(ringToPath).filter(Boolean).join(" ");
  }
  if (type === "MultiPolygon") {
    return coordinates
      .flatMap((poly) => poly.map(ringToPath).filter(Boolean))
      .join(" ");
  }
  return "";
}

const rawPath = path.join(__dirname, "sa-provinces.geojson");
const raw = fs.readFileSync(rawPath, "utf8");
const geo = JSON.parse(raw);

const paths = geo.features
  .map((feature) => {
    const name = feature.properties.name;
    const slug = SLUG_MAP[name];
    if (!slug) return null;
    return {
      slug,
      name,
      d: geometryToPath(feature.geometry).replace(/\s+/g, " ").trim(),
    };
  })
  .filter((p) => p && p.d.length > 10);

const lines = [
  "export interface SaProvincePath {",
  "  slug: string;",
  "  name: string;",
  "  d: string;",
  "}",
  "",
  "/** SVG paths projected to match /sa-provinces-map.png (viewBox 0 0 1024 682). */",
  "export const SA_PROVINCE_PATHS: SaProvincePath[] = [",
  ...paths.map(
    (p) =>
      `  { slug: "${p.slug}", name: "${p.name}", d: "${p.d}" },`
  ),
  "];",
  "",
];

fs.writeFileSync(
  path.join(__dirname, "../src/data/sa-province-paths.ts"),
  lines.join("\n")
);

console.log("Generated", paths.length, "province paths");
