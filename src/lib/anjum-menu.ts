export const ANJUM_CATEGORIES = ["Midday", "Kabab", "Ruti / Porota"] as const;

export type AnjumCategory = (typeof ANJUM_CATEGORIES)[number];

export interface AnjumTimeWindow {
  label: string;
  /** 24-hour start/end, inclusive start, exclusive end */
  startHour: number;
  endHour: number;
}

export const ANJUM_CATEGORY_WINDOW: Record<AnjumCategory, AnjumTimeWindow> = {
  Midday: { label: "11:00 AM – 5:00 PM", startHour: 11, endHour: 17 },
  Kabab: { label: "5:00 PM – 10:00 PM", startHour: 17, endHour: 22 },
  "Ruti / Porota": { label: "5:00 PM – 10:00 PM", startHour: 17, endHour: 22 },
};

/** Top-level menu tabs shown on the Anjum Kabab Ghor menu page. */
export const ANJUM_TOP_TABS = ["Midday", "Afternoon/Evening"] as const;
export type AnjumTopTab = (typeof ANJUM_TOP_TABS)[number];

/** The Afternoon/Evening tab expands into these dropdown subcategories. */
export const AFTERNOON_SUBCATEGORIES: { category: AnjumCategory; label: string }[] = [
  { category: "Kabab", label: "Kabab / Grill" },
  { category: "Ruti / Porota", label: "Ruti / Porota" },
];

export interface AnjumItem {
  id: string;
  category: AnjumCategory;
  name: string;
  /** null price means market rate ("Bazar Dor") — not orderable online */
  price: number | null;
}

function slugify(category: AnjumCategory, name: string) {
  return `${category}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const RAW_ITEMS: { category: AnjumCategory; name: string; price: number | null }[] = [
  // Midday
  { category: "Midday", name: "Bhat", price: 30 },
  { category: "Midday", name: "Mach/Shutki Bhorta", price: 50 },
  { category: "Midday", name: "Bhorta / Bhaji", price: 40 },
  { category: "Midday", name: "Lau Shobji", price: 40 },
  { category: "Midday", name: "Tehari Half", price: 160 },
  { category: "Midday", name: "Chicken Biryani Half", price: 180 },
  { category: "Midday", name: "Beef Kacchi Biryani Half", price: 250 },
  { category: "Midday", name: "Mutton Kacchi Biryani Half", price: 280 },
  { category: "Midday", name: "Chicken Malaikari", price: 150 },
  { category: "Midday", name: "Chicken Roast", price: 160 },
  { category: "Midday", name: "Beef Chui Jhal", price: 300 },
  { category: "Midday", name: "Hash Bhuna", price: 280 },
  { category: "Midday", name: "Khashir Rezala", price: 250 },
  { category: "Midday", name: "Dal Khashi", price: 250 },
  { category: "Midday", name: "Alu Khashi", price: 250 },
  { category: "Midday", name: "Palong Khashi", price: 250 },
  { category: "Midday", name: "Badam Khashi", price: 280 },
  { category: "Midday", name: "Coral", price: 220 },
  { category: "Midday", name: "Kobutor", price: 400 },
  { category: "Midday", name: "Beef Lal Bhuna", price: 280 },
  { category: "Midday", name: "Beef Kala Bhuna", price: 300 },
  { category: "Midday", name: "Beef Khichuri", price: 230 },
  { category: "Midday", name: "Chicken Khichuri", price: 200 },
  { category: "Midday", name: "Borhani (Glass)", price: 50 },
  { category: "Midday", name: "Shokol Mach", price: null },

  // Afternoon/Evening — Kabab
  { category: "Kabab", name: "Chicken Chap", price: 150 },
  { category: "Kabab", name: "Chicken Tandoori", price: 150 },
  { category: "Kabab", name: "Chicken Tikka", price: 220 },
  { category: "Kabab", name: "Chicken Grill Quarter", price: 120 },
  { category: "Kabab", name: "Chicken Grill Full", price: 480 },
  { category: "Kabab", name: "Chicken Boti Kabab", price: 150 },
  { category: "Kabab", name: "Chicken Reshmi Kabab", price: 180 },
  { category: "Kabab", name: "Chicken Tawa", price: 180 },
  { category: "Kabab", name: "Chicken Tawa Khashi", price: 180 },
  { category: "Kabab", name: "Chicken Hariyali Kabab", price: 180 },
  { category: "Kabab", name: "Beef Shik", price: 200 },
  { category: "Kabab", name: "Beef Chap", price: 200 },
  { category: "Kabab", name: "Beef Tawa", price: 220 },
  { category: "Kabab", name: "Mutton Boti", price: 250 },
  { category: "Kabab", name: "Brain Masala", price: 200 },
  { category: "Kabab", name: "Shobji", price: 40 },
  { category: "Kabab", name: "Coral Bar-B-Q", price: null },
  { category: "Kabab", name: "Rupchanda Bar-B-Q", price: null },
  { category: "Kabab", name: "Tilapia Bar-B-Q", price: null },

  // Afternoon/Evening — Ruti / Porota
  { category: "Ruti / Porota", name: "Regular Naan", price: 40 },
  { category: "Ruti / Porota", name: "Bombay Naan", price: 50 },
  { category: "Ruti / Porota", name: "Butter Naan", price: 50 },
  { category: "Ruti / Porota", name: "Garlic Naan", price: 70 },
  { category: "Ruti / Porota", name: "Special Garlic Naan", price: 90 },
  { category: "Ruti / Porota", name: "Ananas Special Naan", price: 100 },
  { category: "Ruti / Porota", name: "Kashmiri Naan", price: 150 },
  { category: "Ruti / Porota", name: "Kashmiri Porota", price: 100 },
  { category: "Ruti / Porota", name: "Shahi Porota", price: 120 },
  { category: "Ruti / Porota", name: "Porota", price: 20 },
  { category: "Ruti / Porota", name: "Luchi Porota", price: 50 },
  { category: "Ruti / Porota", name: "Bombay Porota", price: 50 },
  { category: "Ruti / Porota", name: "Alu Porota", price: 80 },
  { category: "Ruti / Porota", name: "Chicken Moghlai", price: 250 },
  { category: "Ruti / Porota", name: "Beef Moghlai", price: 260 },
  { category: "Ruti / Porota", name: "Dim Moghlai", price: 100 },
  { category: "Ruti / Porota", name: "Rumali Ruti", price: 40 },
  { category: "Ruti / Porota", name: "Chaler Siddho Ruti", price: 25 },
  { category: "Ruti / Porota", name: "Shobji", price: 40 },
  { category: "Ruti / Porota", name: "Cha", price: 35 },
];

export const ANJUM_MENU: AnjumItem[] = RAW_ITEMS.map((item) => ({
  id: slugify(item.category, item.name),
  ...item,
}));

export function isAnjumCategoryOpen(category: AnjumCategory, date: Date = new Date()): boolean {
  const window = ANJUM_CATEGORY_WINDOW[category];
  const hour = date.getHours();
  return hour >= window.startHour && hour < window.endHour;
}
