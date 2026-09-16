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
