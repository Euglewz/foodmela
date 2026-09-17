export const DELIVERY_SECTOR_NUMBERS = [3, 5, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18];

export const DELIVERY_SECTORS = DELIVERY_SECTOR_NUMBERS.map(
  (n) => `Uttara, Sector ${n}`,
);

export const DELIVERY_NOTE =
  "Delivery is only available in Uttara, Sector - " +
  DELIVERY_SECTOR_NUMBERS.join(", ") +
  ".";

export const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery" },
  { id: "bkash_nagad", label: "bKash / Nagad" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

// Customers sometimes type "Road 12" or "House 3" themselves; drop that word so it isn't repeated.
function withoutLeadingWord(value: string, words: string): string {
  return value.trim().replace(new RegExp(`^(${words})\\b\\.?\\s*(no\\.?|number|#)?\\s*[:\\-]?\\s*`, "i"), "");
}

export function formatDeliveryAddress(order: { sector: string; roadNumber: string; houseDetails: string }): string {
  return `${order.sector}, Road ${withoutLeadingWord(order.roadNumber, "road|rd")}, House ${withoutLeadingWord(order.houseDetails, "house")}`;
}
