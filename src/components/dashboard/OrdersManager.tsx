"use client";

import { useEffect, useRef, useState } from "react";
import { formatTk } from "@/lib/currency";
import { formatDeliveryAddress } from "@/lib/delivery";
import { NEW_ORDERS_EVENT, ORDERS_UPDATED_EVENT } from "@/lib/order-events";
import { printOrderReceipt } from "@/lib/print-receipt";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/order-status";

type ApiOrder = {
  id: string;
  status: string;
  total: number;
  sector: string;
  roadNumber: string;
  houseDetails: string;
  paymentMethod: string;
  createdAt: string;
  restaurant: { id: string; name: string };
  customer: { id: string; name: string; phone: string | null };
  rider: { id: string; name: string; phone: string | null } | null;
  items: { id: string; name: string; price: number; qty: number }[];
};

type Rider = { id: string; name: string };

const STATUS_FLOW: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const DELIVERY_STATUSES = ["OUT_FOR_DELIVERY", "DELIVERED"];

const RECEIPT_STATUSES = ["CONFIRMED", "OUT_FOR_DELIVERY", "DELIVERED"];

export default function OrdersManager({
  canAssignRider = true,
  canMarkDelivery = true,
  printReceipts = false,
}: {
  canAssignRider?: boolean;
  canMarkDelivery?: boolean;
  printReceipts?: boolean;
}) {
  const [tab, setTab] = useState<"current" | "history">("current");
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const tabRef = useRef(tab);
  const latestRequest = useRef(0);

  // Reloads can finish out of order (e.g. a refresh after "Mark Confirmed" landing after the user
  // switched tabs), so only the newest request for the tab on screen may update the list.
  async function load() {
    const requestId = ++latestRequest.current;
    const scope = tabRef.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?scope=${scope}`);
      const data = await res.json();
      if (requestId !== latestRequest.current) return;
      setOrders(data.orders ?? []);
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }

  useEffect(() => {
    tabRef.current = tab;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [tab]);

  useEffect(() => {
    window.addEventListener(NEW_ORDERS_EVENT, load);
    return () => window.removeEventListener(NEW_ORDERS_EVENT, load);
  }, []);

  useEffect(() => {
    if (!canAssignRider) return;
    fetch("/api/users?role=RIDER")
      .then((res) => res.json())
      .then((data) => setRiders(data.users ?? []));
  }, [canAssignRider]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      load();
      window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
      if (printReceipts && status === "CONFIRMED") {
        const { order } = (await res.json()) as { order: ApiOrder };
        printOrderReceipt(order);
      }
    }
  }

  async function assignRider(id: string, riderId: string) {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ riderId: riderId || null }),
    });
    if (res.ok) load();
  }

  return (
    <div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab("current")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "current" ? "border-maroon bg-maroon text-cream" : "border-maroon/20 bg-white/70 text-ink/70"
          }`}
        >
          Current Orders
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
            tab === "history" ? "border-maroon bg-maroon text-cream" : "border-maroon/20 bg-white/70 text-ink/70"
          }`}
        >
          Order History
        </button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink/50">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="mt-6 text-sm text-ink/50">No orders here yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-maroon/15 bg-white/60 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">
                    {order.restaurant.name} · {order.customer.name}
                  </p>
                  <p className="text-xs text-ink/50">
                    {formatDeliveryAddress(order)}
                  </p>
                  <p className="text-xs text-ink/50">
                    {new Date(order.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_COLOR[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>

              <ul className="mt-3 flex flex-col gap-1 border-t border-maroon/15 pt-3 text-sm">
                {order.items.map((line) => (
                  <li key={line.id} className="flex justify-between text-ink/80">
                    <span>
                      {line.qty} × {line.name}
                    </span>
                    <span>{formatTk(line.price * line.qty)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex justify-between border-t border-maroon/15 pt-2 text-sm font-medium">
                <span>Total</span>
                <span className="text-maroon">{formatTk(order.total)}</span>
              </div>

              {(tab === "current" ||
                (canAssignRider && order.status === "CONFIRMED") ||
                (printReceipts && RECEIPT_STATUSES.includes(order.status))) && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-maroon/15 pt-4">
                  {tab === "current" &&
                    STATUS_FLOW[order.status]
                      ?.filter((next) => canMarkDelivery || !DELIVERY_STATUSES.includes(next))
                      .map((next) => (
                        <button
                          key={next}
                          type="button"
                          onClick={() => updateStatus(order.id, next)}
                          className="rounded-full border border-maroon/20 px-4 py-1.5 text-xs font-semibold text-maroon transition-colors hover:bg-maroon/5"
                        >
                          Mark {ORDER_STATUS_LABEL[next]}
                        </button>
                      ))}

                  {printReceipts && RECEIPT_STATUSES.includes(order.status) && (
                    <button
                      type="button"
                      onClick={() => printOrderReceipt(order)}
                      className="rounded-full border border-maroon/20 px-4 py-1.5 text-xs font-semibold text-ink/70 transition-colors hover:bg-maroon/5"
                    >
                      🖨️ Print receipt
                    </button>
                  )}

                  {canAssignRider && (tab === "current" || order.status === "CONFIRMED") && (
                    <select
                      value={order.rider?.id ?? ""}
                      onChange={(e) => assignRider(order.id, e.target.value)}
                      className="rounded-full border border-maroon/20 bg-white/70 px-3 py-1.5 text-xs text-ink focus:border-maroon focus:outline-none"
                    >
                      <option value="">Assign rider…</option>
                      {riders.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {order.rider &&
                (order.status === "DELIVERED" ? (
                  <p className="mt-2 text-xs text-ink/50">Delivered by: {order.rider.name}</p>
                ) : (
                  <p className="mt-2 text-xs text-ink/50">
                    Rider: {order.rider.name} {order.rider.phone ? `(${order.rider.phone})` : ""}
                  </p>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
