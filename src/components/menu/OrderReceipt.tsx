import { formatTk } from "@/lib/currency";
import { formatDeliveryAddress, PAYMENT_METHODS } from "@/lib/delivery";
import type { ActiveOrder } from "@/lib/order-context";

export default function OrderReceipt({ order }: { order: ActiveOrder }) {
  const paymentLabel = PAYMENT_METHODS.find(
    (m) => m.id === order.paymentMethod,
  )?.label;
  const confirmedAt = new Date(order.confirmedAt);

  return (
    <div className="rounded-2xl border border-maroon/15 bg-white p-6">
      <div className="text-center">
        <p className="text-xs font-medium tracking-wide text-ink/50 uppercase">
          Receipt
        </p>
        <h2 className="mt-1 font-serif text-2xl font-semibold text-maroon">
          {order.restaurantName}
        </h2>
        <p className="mt-1 text-xs text-ink/50">
          {confirmedAt.toLocaleString("en-US", {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </div>

      <ul className="mt-5 flex flex-col gap-2 border-t border-maroon/15 pt-4">
        {order.lines.map((line) => (
          <li key={line.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ink">
              {line.qty} × {line.name}
            </span>
            <span className="shrink-0 font-medium text-ink">
              {formatTk(line.price * line.qty)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-maroon/15 pt-4">
        <span className="text-sm font-medium text-ink">Total</span>
        <span className="font-serif text-lg font-semibold text-maroon">
          {formatTk(order.total)}
        </span>
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-maroon/15 pt-4 text-sm">
        <div className="flex gap-2">
          <dt className="font-medium text-maroon">Deliver to:</dt>
          <dd className="text-ink/80">
            {formatDeliveryAddress(order)}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="font-medium text-maroon">Payment:</dt>
          <dd className="text-ink/80">{paymentLabel}</dd>
        </div>
      </dl>
    </div>
  );
}
