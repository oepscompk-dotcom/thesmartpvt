export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "—";
  const datePart = dateStr.split(" ")[0].split("T")[0];
  const parts = datePart.split("-");
  if (parts.length !== 3) return dateStr;
  const [yyyy, mm, dd] = parts;
  return `${dd}-${mm}-${yyyy}`;
}

export function toStorageDate(): string {
  return new Date().toISOString().split("T")[0];
}
