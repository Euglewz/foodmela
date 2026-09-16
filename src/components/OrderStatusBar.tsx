"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/Modal";
import { formatTk } from "@/lib/currency";
import { ORDER_STATUS_LABEL } from "@/lib/order-status";
import { PAYMENT_METHODS } from "@/lib/delivery";

type LiveOrder = {
  id: string;
  status: string;
  total: number;
  sector: string;
  roadNumber: string;
  houseDetails: string;
  paymentMethod: string;
  createdAt: string;
  restaurant: { name: string };
  items: { id: string; name: string; price: number; qty: number }[];
};

const STATUS_MESSAGE: Record<string, string> = {
  PENDING: "Your order has been placed",
  CONFIRMED: "Food preparation is under way",
  OUT_FOR_DELIVERY: "Your order is out for delivery",
};

export default function OrderStatusBar() {
  const [order, setOrder] = useState<LiveOrder | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const me = await fetch("/api/auth/me").then((res) => res.json());
      if (cancelled) return;
      if (me.user?.role !== "CUSTOMER") {
        setOrder(null);
        return;
      }
      const data = await fetch("/api/orders?scope=current").then((res) => res.json());
      if (cancelled) return;
      setOrder(data.orders?.[0] ?? null);
    }

    load();
    const id = setInterval(load, 20_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!order) return null;

  const paymentLabel = PAYMENT_METHODS.find((m) => m.id === order.paymentMethod)?.label;

  return (
    <>
      <button
        type="button"
        onClick={() => setShowReceipt(true)}
        className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-center gap-2 rounded-full bg-maroon px-5 py-3 text-sm font-semibold text-cream shadow-lg transition-colors hover:bg-maroon-dark sm:inset-x-auto sm:right-4"
      >
        <span aria-hidden="true">🍳</span>
        {STATUS_MESSAGE[order.status] ?? ORDER_STATUS_LABEL[order.status]}
      </button>

      {showReceipt && (
        <Modal onClose={() => setShowReceipt(false)}>
          <div className="rounded-2xl border border-maroon/15 bg-white/70 p-6">
            <div className="text-center">
              <p className="text-xs font-medium tracking-wide text-ink/50 uppercase">Receipt</p>
              <h2 className="mt-1 font-serif text-2xl font-semibold text-maroon">
                {order.restaurant.name}
              </h2>
              <p className="mt-1 text-xs text-ink/50">
                {new Date(order.createdAt).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="mt-2 text-sm font-semibold text-maroon">
                {ORDER_STATUS_LABEL[order.status]}
              </p>
            </div>

            <ul className="mt-5 flex flex-col gap-2 border-t border-maroon/15 pt-4">
              {order.items.map((line) => (
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
                  {order.sector}, Road {order.roadNumber} — {order.houseDetails}
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="font-medium text-maroon">Payment:</dt>
                <dd className="text-ink/80">{paymentLabel}</dd>
              </div>
            </dl>
          </div>
        </Modal>
      )}
    </>
  );
}
