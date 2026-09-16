"use client";

import { useEffect, useMemo, useState } from "react";
import { formatTk } from "@/lib/currency";
import SearchBar from "@/components/menu/SearchBar";
import MenuItemModal, { type MenuItemFormValue } from "@/components/dashboard/MenuItemModal";

type ApiMenuItem = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  category: string;
  availabilityDays: string;
  availabilityStart: string | null;
  availabilityEnd: string | null;
  isAvailable: boolean;
  restaurant: { id: string; name: string; slug: string };
};

function emptyForm(restaurantId: string): MenuItemFormValue {
  return {
    restaurantId,
    name: "",
    description: "",
    price: "",
    category: "",
    availabilityDays: [],
    availabilityStart: "",
    availabilityEnd: "",
    imageUrl: null,
  };
}

export default function ManageMenuTable() {
  const [items, setItems] = useState<ApiMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState<string>("all");
  const [modalItem, setModalItem] = useState<MenuItemFormValue | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadItems() {
    setLoading(true);
    const res = await fetch("/api/menu");
    const data = await res.json();
    setItems(data.items ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadItems();
  }, []);

  const restaurants = useMemo(() => {
    const map = new Map<string, { id: string; name: string }>();
    items.forEach((i) => map.set(i.restaurant.id, { id: i.restaurant.id, name: i.restaurant.name }));
    return Array.from(map.values());
  }, [items]);

  const filtered = items.filter(
    (item) =>
      (restaurantFilter === "all" || item.restaurant.id === restaurantFilter) &&
      item.name.toLowerCase().includes(query.toLowerCase()),
  );

  async function toggleAvailability(item: ApiMenuItem) {
    setError(null);
    const res = await fetch(`/api/menu/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    if (!res.ok) {
      setError("Could not update availability.");
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i)),
    );
  }

  function openEdit(item: ApiMenuItem) {
    setModalItem({
      id: item.id,
      restaurantId: item.restaurant.id,
      name: item.name,
      description: item.description,
      price: item.price === null ? "" : String(item.price),
      category: item.category,
      availabilityDays: JSON.parse(item.availabilityDays),
      availabilityStart: item.availabilityStart ?? "",
      availabilityEnd: item.availabilityEnd ?? "",
      imageUrl: item.imageUrl,
    });
  }

  function openCreate() {
    if (restaurants.length === 0) return;
    setModalItem(emptyForm(restaurantFilter !== "all" ? restaurantFilter : restaurants[0].id));
  }

  async function handleSave(form: MenuItemFormValue, imageFile: File | null) {
    const isCreate = !form.id;
    const fd = new FormData();
    fd.set("name", form.name);
    fd.set("description", form.description);
    fd.set("price", form.price);
    fd.set("category", form.category);
    fd.set("availabilityDays", JSON.stringify(form.availabilityDays));
    fd.set("availabilityStart", form.availabilityStart);
    fd.set("availabilityEnd", form.availabilityEnd);
    if (imageFile) fd.set("image", imageFile);

    let res: Response;
    if (isCreate) {
      res = await fetch("/api/menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: form.restaurantId,
          name: form.name,
          description: form.description,
          price: form.price === "" ? null : Number(form.price),
          category: form.category,
          availabilityDays: form.availabilityDays,
          availabilityStart: form.availabilityStart || null,
          availabilityEnd: form.availabilityEnd || null,
        }),
      });
      if (res.ok && imageFile) {
        const created = await res.json();
        await fetch(`/api/menu/${created.item.id}`, { method: "PATCH", body: fd });
      }
    } else {
      res = await fetch(`/api/menu/${form.id}`, { method: "PATCH", body: fd });
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error ?? "Could not save item.");
    }
    setModalItem(null);
    await loadItems();
  }

  async function handleDelete(item: ApiMenuItem) {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/menu/${item.id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="max-w-sm flex-1">
            <SearchBar value={query} onChange={setQuery} placeholder="Search item by name" />
          </div>
          {restaurants.length > 1 && (
            <select
              value={restaurantFilter}
              onChange={(e) => setRestaurantFilter(e.target.value)}
              className="rounded-full border border-maroon/20 bg-white/70 px-4 py-2 text-sm text-ink focus:border-maroon focus:outline-none"
            >
              <option value="all">All Restaurants</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="shrink-0 rounded-full bg-maroon px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark"
        >
          + Add Item
        </button>
      </div>

      {error && <p className="mt-3 rounded-lg bg-maroon/10 px-3 py-2 text-sm text-maroon">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-ink/50">Loading menu…</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 rounded-xl border border-maroon/15 bg-white/60 p-4"
            >
              <button
                type="button"
                onClick={() => toggleAvailability(item)}
                aria-label={item.isAvailable ? "Mark unavailable" : "Mark available"}
                className={`flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors ${
                  item.isAvailable ? "bg-maroon justify-end" : "bg-ink/20 justify-start"
                }`}
              >
                <span className="h-5 w-5 rounded-full bg-white shadow" />
              </button>

              <div className="min-w-0 flex-1">
                <p className={`font-medium text-ink ${!item.isAvailable ? "opacity-50" : ""}`}>
                  {item.name}
                </p>
                <p className="text-xs text-ink/50">
                  {item.restaurant.name} · {item.category} ·{" "}
                  {item.price !== null ? formatTk(item.price) : "Market price"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => openEdit(item)}
                className="shrink-0 rounded-full border border-maroon/20 px-4 py-1.5 text-xs font-semibold text-maroon transition-colors hover:bg-maroon/5"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="shrink-0 rounded-full border border-maroon/20 px-3 py-1.5 text-xs font-semibold text-ink/50 transition-colors hover:bg-maroon/5"
              >
                Delete
              </button>
            </div>
          ))}
          {filtered.length === 0 && <p className="text-sm text-ink/50">No items match.</p>}
        </div>
      )}

      {modalItem && (
        <MenuItemModal
          value={modalItem}
          restaurants={restaurants}
          onClose={() => setModalItem(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
