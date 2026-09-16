"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useCartContext, type RestaurantSlug } from "@/lib/cart-context";
import { useOrderContext } from "@/lib/order-context";
import { formatTk } from "@/lib/currency";
import { DELIVERY_NOTE, DELIVERY_SECTORS, PAYMENT_METHODS } from "@/lib/delivery";
import type { PaymentMethodId } from "@/lib/delivery";
import OrderReceipt from "@/components/menu/OrderReceipt";

const RESTAURANT_INFO: Record<RestaurantSlug, { name: string; menuHref: string }> = {
  "food-mela": { name: "Food Mela", menuHref: "/menu/food-mela" },
  "anjum-kabab-ghor": { name: "Anjum Kabab Ghor", menuHref: "/menu/anjum-kabab-ghor" },
};

function isRestaurantSlug(value: string): value is RestaurantSlug {
  return value === "food-mela" || value === "anjum-kabab-ghor";
}

type RemoteItem = { id: string; name: string; price: number | null; isAvailable: boolean };

export default function CheckoutPage() {
  const params = useParams<{ restaurant: string }>();
  const router = useRouter();
  const cart = useCartContext();
  const order = useOrderContext();

  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [remoteItems, setRemoteItems] = useState<RemoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [sector, setSector] = useState("");
  const [roadNumber, setRoadNumber] = useState("");
  const [houseDetails, setHouseDetails] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>("cod");
  const [justConfirmed, setJustConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const restaurantParam = params.restaurant;

  useEffect(() => {
    if (!isRestaurantSlug(restaurantParam)) return;
    fetch(`/api/auth/me`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.user) {
          router.replace(`/login?next=/checkout/${restaurantParam}`);
          return;
        }
        setCheckingAuth(false);
      })
      .catch(() => setCheckingAuth(false));
  }, [restaurantParam, router]);

  useEffect(() => {
    if (!isRestaurantSlug(restaurantParam)) return;
    fetch(`/api/public/menu?slug=${restaurantParam}`)
      .then((res) => res.json())
      .then((data) => {
        setRestaurantId(data.restaurant?.id ?? null);
        setRemoteItems(data.items ?? []);
      })
      .finally(() => setLoading(false));
  }, [restaurantParam]);

  const lines = useMemo(() => {
    if (!isRestaurantSlug(restaurantParam)) return [];
    const cartOf = cart.cartOf(restaurantParam);
    return remoteItems
      .filter((item) => (cartOf[item.id] ?? 0) > 0 && item.price !== null)
      .map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price as number,
        qty: cartOf[item.id],
      }));
  }, [restaurantParam, remoteItems, cart]);

  if (!isRestaurantSlug(restaurantParam)) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold text-maroon">
          Restaurant not found
        </h1>
        <Link href="/menu" className="text-sm font-medium text-maroon underline">
          Back to menu
        </Link>
      </div>
    );
  }

  const info = RESTAURANT_INFO[restaurantParam];
  const total = lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  const canConfirm =
    sector !== "" &&
    roadNumber.trim() !== "" &&
    houseDetails.trim() !== "" &&
    lines.length > 0 &&
    !submitting;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canConfirm || !isRestaurantSlug(restaurantParam) || !restaurantId) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          lines,
          sector,
          roadNumber: roadNumber.trim(),
          houseDetails: houseDetails.trim(),
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error ?? "Could not place your order.");
        return;
      }
      order.placeOrder({
        restaurant: restaurantParam,
        restaurantName: info.name,
        lines,
        total,
        sector,
        roadNumber: roadNumber.trim(),
        houseDetails: houseDetails.trim(),
        paymentMethod,
        confirmedAt: new Date().toISOString(),
      });
      cart.clearCart(restaurantParam);
      setJustConfirmed(true);
    } catch {
      setSubmitError("Could not place your order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checkingAuth || loading) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-3 px-6 py-24 text-center">
        <p className="text-sm text-ink/50">Loading…</p>
      </div>
    );
  }

  if (justConfirmed && order.activeOrder) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-4 px-6 py-16">
        <h1 className="text-center font-serif text-2xl font-semibold text-maroon">
          Order Confirmed!
        </h1>
        <OrderReceipt order={order.activeOrder} />
        <Link
          href="/"
          className="mt-2 inline-flex w-fit items-center gap-2 self-center rounded-full bg-maroon px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
        <h1 className="font-serif text-2xl font-semibold text-maroon">
          Your cart is empty
        </h1>
        <Link
          href={info.menuHref}
          className="text-sm font-medium text-maroon underline"
        >
          Browse the {info.name} menu
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">
      <h1 className="font-serif text-3xl font-semibold text-maroon">
        Checkout — {info.name}
      </h1>
      <p className="mt-1 text-sm text-ink/60">
        Review your order, choose a delivery location, and pick a payment
        method.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[1fr_280px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          {submitError && (
            <p className="rounded-lg bg-maroon/10 px-3 py-2 text-sm text-maroon">{submitError}</p>
          )}

          <section>
            <h2 className="text-lg font-semibold text-ink">Delivery Location</h2>
            <p className="mt-1 text-xs text-ink/50">{DELIVERY_NOTE}</p>

            <div className="mt-4 flex flex-col gap-4">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink">Sector</span>
                <select
                  required
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
                >
                  <option value="" disabled>
                    Select your sector
                  </option>
                  {DELIVERY_SECTORS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink">Road Number</span>
                <input
                  type="text"
                  required
                  value={roadNumber}
                  onChange={(e) => setRoadNumber(e.target.value)}
                  placeholder="e.g. Road 12"
                  className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-maroon focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-sm">
                <span className="font-medium text-ink">House Number &amp; Details</span>
                <input
                  type="text"
                  required
                  value={houseDetails}
                  onChange={(e) => setHouseDetails(e.target.value)}
                  placeholder="e.g. House 34, 3rd Floor"
                  className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:border-maroon focus:outline-none"
                />
              </label>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-ink">Payment Method</h2>
            <div className="mt-4 flex flex-col gap-3">
              {PAYMENT_METHODS.map((method) => (
                <label
                  key={method.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                    paymentMethod === method.id
                      ? "border-maroon bg-maroon/5"
                      : "border-maroon/20 bg-white/70"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={method.id}
                    checked={paymentMethod === method.id}
                    onChange={() => setPaymentMethod(method.id)}
                    className="h-4 w-4 accent-maroon"
                  />
                  <span className="font-medium text-ink">{method.label}</span>
                </label>
              ))}
            </div>
          </section>

          <button
            type="submit"
            disabled={!canConfirm}
            className="w-full rounded-full bg-maroon py-3 text-sm font-semibold text-cream transition-colors enabled:hover:bg-maroon-dark disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? "Placing order…" : "Confirm Order"}
          </button>
        </form>

        <aside className="h-fit rounded-2xl border border-maroon/15 bg-white/60 p-5">
          <h2 className="font-serif text-lg font-semibold text-maroon">
            Order Summary
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {lines.map((line) => (
              <li key={line.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{line.name}</p>
                  <p className="text-xs text-ink/50">
                    {line.qty} × {formatTk(line.price)}
                  </p>
                </div>
                <span className="shrink-0 font-medium text-ink">
                  {formatTk(line.price * line.qty)}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t border-maroon/15 pt-4">
            <span className="text-sm font-medium text-ink">Total</span>
            <span className="font-serif text-lg font-semibold text-maroon">
              {formatTk(total)}
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}
