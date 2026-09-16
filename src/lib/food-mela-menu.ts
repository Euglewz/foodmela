export const FOOD_MELA_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
] as const;

export type FoodMelaDay = (typeof FOOD_MELA_DAYS)[number];

export const FOOD_MELA_TIERS = ["Budget", "Standard", "Premium"] as const;

export type FoodMelaTier = (typeof FOOD_MELA_TIERS)[number];

export interface FoodMelaItem {
  id: string;
  day: FoodMelaDay;
  tier: FoodMelaTier;
  description: string;
  price: number;
}

const RAW_MENU: Record<FoodMelaTier, Record<FoodMelaDay, { description: string; price: number }>> = {
  Budget: {
    Saturday: { description: "Bhat, Rui Machh, Mishro Sobji, Dal, Salad", price: 130 },
    Sunday: { description: "Bhat, Chicken Curry, Alu Bhorta, Dal, Salad", price: 130 },
    Monday: { description: "Bhat, Dim Bhuna, Begun Bhaji, Dal, Salad", price: 130 },
    Tuesday: { description: "Bhat, Telapia Machh, Sobji, Dal, Bhorta", price: 140 },
    Wednesday: { description: "Bhat, Chicken Roast, Pepe Bhaji, Dal, Salad", price: 140 },
    Thursday: { description: "Bhuna Khichuri, Dim Bhaji, Begun Bhaji, Salad", price: 150 },
    Friday: { description: "Sada Pulao, Chicken Korma, Salad", price: 150 },
  },
  Standard: {
    Saturday: { description: "Bhat, Rui Machh Bhuna, Mishro Sobji, Dal, Bhorta, Salad", price: 170 },
    Sunday: { description: "Bhat, Chicken Kosha, Alu Bhorta, Dal, Sobji, Salad", price: 180 },
    Monday: { description: "Bhat, Gorur Mangsho, Sobji, Dal, Bhorta, Salad", price: 200 },
    Tuesday: { description: "Bhat, Ilish Bhaja, Dal, Shak, Bhorta, Salad", price: 200 },
    Wednesday: { description: "Bhat, Chicken Roast, Begun Bhaji, Dal, Salad", price: 190 },
    Thursday: { description: "Bhuna Khichuri, Gorur Mangsho, Dim, Salad", price: 200 },
    Friday: { description: "Chicken Tehari, Dim, Salad, Borhani", price: 200 },
  },
  Premium: {
    Saturday: { description: "Basmati Bhat, Rui Machh Bhuna, Sobji, Dal, 2 Dhoroner Bhorta, Salad", price: 220 },
    Sunday: { description: "Pulao, Chicken Roast, Borhani, Salad", price: 235 },
    Monday: { description: "Bhat, Gorur Kosha, Sobji, Dal, Bhorta, Salad", price: 280 },
    Tuesday: { description: "Bhat, Ilish Machh, Shak, Dal, Bhorta, Salad", price: 250 },
    Wednesday: { description: "Pulao, Chicken Korma, Dim Korma, Salad", price: 235 },
    Thursday: { description: "Bhuna Khichuri, Gorur Mangsho, Dim, Begun Bhaji, Salad", price: 245 },
    Friday: { description: "Kacchi/Chicken Biriyani, Borhani, Salad", price: 250 },
  },
};

export const FOOD_MELA_MENU: FoodMelaItem[] = FOOD_MELA_TIERS.flatMap((tier) =>
  FOOD_MELA_DAYS.map((day) => ({
    id: `${tier}-${day}`.toLowerCase(),
    day,
    tier,
    description: RAW_MENU[tier][day].description,
    price: RAW_MENU[tier][day].price,
  })),
);

/** Maps JS Date#getDay() (0 = Sunday) to our day labels (week starts Saturday). */
export function getFoodMelaDayName(date: Date = new Date()): FoodMelaDay {
  const jsDay = date.getDay();
  const index = (jsDay + 1) % 7; // shift so Saturday = 0
  return FOOD_MELA_DAYS[index];
}
