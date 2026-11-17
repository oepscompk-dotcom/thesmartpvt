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

export function todayLocalDate(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function createdAtForDate(pickedDate?: string): string {
  const now = new Date().toISOString();
  if (!pickedDate || pickedDate === now.slice(0, 10)) return now;
  return `${pickedDate}T${now.slice(11)}`;
}
