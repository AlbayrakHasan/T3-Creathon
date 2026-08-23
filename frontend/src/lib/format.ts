export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}
