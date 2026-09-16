import Link from "next/link";
import { formatTk } from "@/lib/currency";
import { DELIVERY_NOTE } from "@/lib/delivery";
import type { RestaurantSlug } from "@/lib/cart-context";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

type CartPanelProps = {
  restaurantName: string;
  restaurantSlug: RestaurantSlug;
  lines: CartLine[];
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
};

export default function CartPanel({
  restaurantName,
  restaurantSlug,
  lines,
  onIncrement,
  onDecrement,
}: CartPanelProps) {
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const isEmpty = lines.length === 0;

  return (
    <aside className="sticky top-20 flex h-fit flex-col rounded-2xl border border-maroon/15 bg-white/60 p-5">
      <h2 className="font-serif text-lg font-semibold text-maroon">
        Your Order
      </h2>
      <p className="text-xs text-ink/50">{restaurantName}</p>

      {isEmpty ? (
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <p className="text-sm text-ink/50">Your cart is empty.</p>
          <p className="text-xs text-ink/40">Add items from the menu to get started.</p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {lines.map((line) => (
            <li key={line.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium text-ink">{line.name}</p>
                <p className="text-xs text-ink/50">{formatTk(line.price)} each</p>
              </div>
              <div className="flex shrink-0 items-center gap-2 rounded-full bg-maroon/10 px-2 py-1">
                <button
                  type="button"
                  onClick={() => onDecrement(line.id)}
                  className="flex h-5 w-5 items-center justify-center text-maroon"
                  aria-label={`Remove one ${line.name}`}
                >
                  −
                </button>
                <span className="w-4 text-center text-xs font-semibold text-maroon">
                  {line.qty}
                </span>
                <button
                  type="button"
                  onClick={() => onIncrement(line.id)}
                  className="flex h-5 w-5 items-center justify-center text-maroon"
                  aria-label={`Add one more ${line.name}`}
                >
                  +
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-maroon/15 pt-4">
        <span className="text-sm font-medium text-ink">Total</span>
        <span className="font-serif text-lg font-semibold text-maroon">
          {formatTk(total)}
        </span>
      </div>

      <p className="mt-4 text-center text-xs leading-relaxed text-ink/50">
        {DELIVERY_NOTE}
      </p>

      {isEmpty ? (
        <button
          type="button"
          disabled
          className="mt-3 w-full cursor-not-allowed rounded-full bg-maroon py-3 text-sm font-semibold text-cream opacity-40"
        >
          Review Order
        </button>
      ) : (
        <Link
          href={`/checkout/${restaurantSlug}`}
          className="mt-3 block w-full rounded-full bg-maroon py-3 text-center text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark"
        >
          Review Order
        </Link>
      )}
    </aside>
  );
}
