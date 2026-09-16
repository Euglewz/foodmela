"use client";

import { useEffect, useState } from "react";
import { formatTk } from "@/lib/currency";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/order-status";

type ApiOrder = {
  id: string;
  status: string;
  total: number;
  sector: string;
  roadNumber: string;
  houseDetails: string;
  createdAt: string;
  deliveredAt: string | null;
  restaurant: { name: string };
  customer: { name: string; phone: string | null };
  items: { id: string; name: string; qty: number }[];
};

export default function RiderOrders({ history = false }: { history?: boolean }) {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/orders?scope=${history ? "history" : "current"}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function markDelivered(id: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "DELIVERED" }),
    });
    if (res.ok) load();
  }

  async function markOutForDelivery(id: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "OUT_FOR_DELIVERY" }),
    });
    if (res.ok) load();
  }

  if (loading) return <p className="text-sm text-ink/50">Loading…</p>;
  if (orders.length === 0)
    return <p className="text-sm text-ink/50">{history ? "No deliveries yet." : "No orders assigned to you right now."}</p>;

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-2xl border border-maroon/15 bg-white/60 p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-ink">{order.restaurant.name}</p>
              <p className="text-xs text-ink/50">
                Deliver to: {order.sector}, Road {order.roadNumber} — {order.houseDetails}
              </p>
              <p className="text-xs text-ink/50">
                Customer: {order.customer.name} {order.customer.phone ? `(${order.customer.phone})` : ""}
              </p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_COLOR[order.status]}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>

          <ul className="mt-3 flex flex-col gap-1 border-t border-maroon/15 pt-3 text-sm text-ink/80">
            {order.items.map((line) => (
              <li key={line.id}>
                {line.qty} × {line.name}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-maroon/15 pt-2 text-sm font-medium">
            <span>Total</span>
            <span className="text-maroon">{formatTk(order.total)}</span>
          </div>

          {!history && (
            <div className="mt-4 flex gap-2 border-t border-maroon/15 pt-4">
              {order.status === "CONFIRMED" && (
                <button
                  type="button"
                  onClick={() => markOutForDelivery(order.id)}
                  className="rounded-full border border-maroon/20 px-4 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon/5"
                >
                  Mark Out for Delivery
                </button>
              )}
              {order.status === "OUT_FOR_DELIVERY" && (
                <button
                  type="button"
                  onClick={() => markDelivered(order.id)}
                  className="rounded-full border border-maroon/20 px-4 py-1.5 text-xs font-semibold text-maroon hover:bg-maroon/5"
                >
                  Mark Delivered
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
