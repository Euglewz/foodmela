"use client";

import { useState } from "react";
import Modal from "@/components/Modal";
import { formatTk } from "@/lib/currency";
import { scheduleLabelFor, type MenuItemDTO } from "@/lib/menu-types";

export default function MenuItemDetailModal({
  item,
  cartQty,
  onClose,
  onConfirm,
}: {
  item: MenuItemDTO;
  cartQty: number;
  onClose: () => void;
  onConfirm: (qty: number) => void;
}) {
  const [qty, setQty] = useState(Math.max(1, cartQty));
  const scheduleLabel = scheduleLabelFor(item);
  const canOrder = item.price !== null && item.isAvailable;

  return (
    <Modal onClose={onClose}>
      <div className="overflow-hidden rounded-2xl bg-white">
        <div className="relative h-52 w-full bg-maroon/5">
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="h-12 w-12 text-maroon/20">
                <rect x="3" y="4" width="18" height="16" rx="2" />
                <circle cx="8.5" cy="9.5" r="1.5" />
                <path d="m3 16 5-5 4 4 3-3 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        <div className="p-5">
          <h2 className="font-serif text-2xl font-semibold text-ink">{item.name}</h2>
          <p className="mt-1 text-lg font-semibold text-maroon">
            {item.price !== null ? formatTk(item.price) : "Market Price"}
          </p>
          {item.description && <p className="mt-3 text-sm leading-relaxed text-ink/70">{item.description}</p>}
          {scheduleLabel && <p className="mt-3 text-xs font-medium text-maroon/60">{scheduleLabel}</p>}
          {!item.isAvailable && <p className="mt-3 text-sm font-semibold text-maroon">Currently unavailable</p>}
          {item.price === null && item.isAvailable && (
            <p className="mt-3 text-sm font-semibold text-maroon">Please call the restaurant to order this item.</p>
          )}
        </div>

        {canOrder && (
          <div className="flex items-center gap-3 border-t border-maroon/15 bg-white p-4">
            <div className="flex items-center gap-3 rounded-full border border-maroon/20 px-3 py-2">
              <button
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="flex h-6 w-6 items-center justify-center text-lg leading-none text-maroon disabled:opacity-30"
                disabled={qty <= 1}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-semibold text-ink">{qty}</span>
              <button
                type="button"
                onClick={() => setQty((q) => q + 1)}
                className="flex h-6 w-6 items-center justify-center text-lg leading-none text-maroon"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => onConfirm(qty)}
              className="flex-1 rounded-full bg-maroon py-3 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark"
            >
              {cartQty > 0 ? "Update cart" : "Add to cart"} · {formatTk((item.price ?? 0) * qty)}
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
