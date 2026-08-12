/** Format homepage/platform stats — exact counts under 100, rounded with "+" above. */
export function formatStat(value: number): string {
  if (value >= 10000) {
    return `${Math.floor(value / 100).toLocaleString("en-ZA")}+`;
  }
  if (value >= 1000) {
    const formatted = Math.floor(value / 100) / 10;
    return `${formatted.toLocaleString("en-ZA")}k+`;
  }
  if (value >= 100) {
    return `${value.toLocaleString("en-ZA")}+`;
  }
  return value.toLocaleString("en-ZA");
}
