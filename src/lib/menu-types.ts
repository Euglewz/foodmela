export type MenuItemDTO = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  category: string;
  availabilityDays: string[];
  availabilityStart: string | null;
  availabilityEnd: string | null;
  isAvailable: boolean;
};

function formatTime12(time: string): string {
  const [hourStr, minuteStr] = time.split(":");
  const hour = Number(hourStr);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minuteStr} ${period}`;
}

/** Informational-only label (requirement: keep the text, never block ordering with it). */
export function scheduleLabelFor(item: MenuItemDTO): string {
  const parts: string[] = [];
  if (item.availabilityDays.length > 0 && item.availabilityDays.length < 7) {
    parts.push(item.availabilityDays.join(", "));
  }
  if (item.availabilityStart && item.availabilityEnd) {
    parts.push(`${formatTime12(item.availabilityStart)} – ${formatTime12(item.availabilityEnd)}`);
  }
  return parts.length > 0 ? `Available ${parts.join(" · ")}` : "";
}
