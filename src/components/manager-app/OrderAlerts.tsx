"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { formatTk } from "@/lib/currency";
import { NEW_ORDERS_EVENT, ORDERS_UPDATED_EVENT } from "@/lib/order-events";

const POLL_MS = 15_000;

type PendingOrder = { id: string; status: string; total: number; restaurant: { name: string } };

function playChime(ctx: AudioContext) {
  const start = ctx.currentTime;
  [880, 1175, 880, 1175].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = start + i * 0.18;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.17);
  });
}

async function showNotification(order: PendingOrder) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const title = "New order";
  const options: NotificationOptions = {
    body: `${order.restaurant.name} · ${formatTk(order.total)}`,
    icon: "/app-icons/icon-192.png",
    tag: order.id,
    data: { url: "/app/orders" },
    requireInteraction: true,
  };
  const registration = await navigator.serviceWorker?.getRegistration("/app");
  if (registration) {
    await registration.showNotification(title, options);
  } else {
    new Notification(title, options);
  }
}

export default function OrderAlerts() {
  const [pending, setPending] = useState<number | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("unsupported");
  const seenIds = useRef<Set<string> | null>(null);
  const audio = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Browsers block sound until the user interacts with the page, so unlock it on the first click.
    function unlockAudio() {
      audio.current ??= new AudioContext();
      void audio.current.resume();
    }

    let cancelled = false;
    async function check() {
      try {
        const res = await fetch("/api/orders?scope=current", { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const { orders } = (await res.json()) as { orders: PendingOrder[] };
        if (cancelled) return;

        const pendingOrders = orders.filter((o) => o.status === "PENDING");
        setPending(pendingOrders.length);

        // The first check only records what is already waiting, so opening the app doesn't alert for old orders.
        const isFirstCheck = seenIds.current === null;
        const seen = (seenIds.current ??= new Set());
        const fresh = pendingOrders.filter((o) => !seen.has(o.id));
        fresh.forEach((o) => seen.add(o.id));
        if (isFirstCheck || fresh.length === 0) return;

        if (audio.current?.state === "running") playChime(audio.current);
        await Promise.all(fresh.map(showNotification));
        window.dispatchEvent(new Event(NEW_ORDERS_EVENT));
      } catch {
        // Network hiccup; the next poll will catch up.
      }
    }

    // Notification permission only exists in the browser, so read it after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (typeof Notification !== "undefined") setPermission(Notification.permission);
    window.addEventListener("pointerdown", unlockAudio);
    window.addEventListener(ORDERS_UPDATED_EVENT, check);
    void check();
    const timer = setInterval(check, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener(ORDERS_UPDATED_EVENT, check);
    };
  }, []);

  async function enableAlerts() {
    audio.current ??= new AudioContext();
    await audio.current.resume();
    playChime(audio.current);
    setPermission(await Notification.requestPermission());
  }

  return (
    <div className="flex items-center gap-2">
      {permission === "default" && (
        <button
          type="button"
          onClick={enableAlerts}
          className="rounded-full border border-cream/40 px-3 py-1.5 text-xs font-semibold text-cream transition-colors hover:bg-cream/10"
        >
          Turn on order alerts
        </button>
      )}
      <Link
        href="/app/orders"
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          pending ? "bg-cream text-maroon hover:bg-white" : "bg-cream/10 text-cream/70 hover:bg-cream/20"
        }`}
      >
        {pending === null ? "…" : pending} pending
      </Link>
    </div>
  );
}
