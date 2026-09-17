"use client";

import { useMemo, useState } from "react";
import {
  FOOD_MELA_DAYS,
  FOOD_MELA_TIERS,
  getFoodMelaDayName,
  type FoodMelaDay,
} from "@/lib/food-mela-menu";
import { scheduleLabelFor, type MenuItemDTO } from "@/lib/menu-types";
import { useCartContext } from "@/lib/cart-context";
import MenuTabs from "@/components/menu/MenuTabs";
import SearchBar from "@/components/menu/SearchBar";
import MenuItemCard from "@/components/menu/MenuItemCard";
import MenuItemDetailModal from "@/components/menu/MenuItemDetailModal";
import CartPanel from "@/components/menu/CartPanel";
import { matchesQuery, menuSuggestions } from "@/lib/menu-search";

const RESTAURANT = "food-mela" as const;

export default function FoodMelaMenuClient({ items }: { items: MenuItemDTO[] }) {
  const today = useMemo(() => getFoodMelaDayName(), []);
  const [activeDay, setActiveDay] = useState<FoodMelaDay>(today);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cart = useCartContext();

  const itemsForDay = items.filter(
    (item) => item.availabilityDays.includes(activeDay) && matchesQuery(item, query),
  );

  const selectedItem = items.find((item) => item.id === selectedId) ?? null;

  function openItem(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item) return;
    // The dish may belong to another day's menu, so switch tabs to where it lives.
    if (!item.availabilityDays.includes(activeDay)) {
      const day = FOOD_MELA_DAYS.find((d) => item.availabilityDays.includes(d));
      if (day) setActiveDay(day);
    }
    setSelectedId(id);
  }

  const cartLines = items
    .filter((item) => cart.qtyOf(RESTAURANT, item.id) > 0)
    .map((item) => ({
      id: item.id,
      name: `${item.category} · ${item.availabilityDays.join(", ")}`,
      price: item.price ?? 0,
      qty: cart.qtyOf(RESTAURANT, item.id),
    }));

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-maroon">
          Food Mela Menu
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Browse every day&rsquo;s menu — for this demonstration, every
          day&rsquo;s items can be added to your cart regardless of today&rsquo;s
          date.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4">
            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search the menu"
              suggestions={menuSuggestions(items, query)}
              onSelectSuggestion={openItem}
            />
          </div>

          <MenuTabs
            tabs={FOOD_MELA_DAYS}
            active={activeDay}
            onChange={setActiveDay}
            labelFor={(day) => (day === today ? `${day} (Today)` : day)}
          />

          <div className="mt-6 flex flex-col gap-8">
            {FOOD_MELA_TIERS.map((tier) => {
              const tierItems = itemsForDay.filter((item) => item.category === tier);
              if (tierItems.length === 0) return null;
              return (
                <section key={tier}>
                  <h2 className="mb-3 text-lg font-semibold text-ink">
                    {tier} Menu
                  </h2>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {tierItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        name={item.name}
                        description={item.description}
                        price={item.price}
                        imageUrl={item.imageUrl}
                        qty={cart.qtyOf(RESTAURANT, item.id)}
                        available={item.isAvailable}
                        scheduleLabel={scheduleLabelFor(item)}
                        onOpen={() => setSelectedId(item.id)}
                      />
                    ))}
                  </div>
                </section>
              );
            })}

            {itemsForDay.length === 0 && (
              <p className="text-sm text-ink/50">No items match your search.</p>
            )}
          </div>
        </div>

        <CartPanel
          restaurantName="Food Mela"
          restaurantSlug={RESTAURANT}
          lines={cartLines}
          onIncrement={(id) => cart.increment(RESTAURANT, id)}
          onDecrement={(id) => cart.decrement(RESTAURANT, id)}
        />
      </div>

      {selectedItem && (
        <MenuItemDetailModal
          item={selectedItem}
          cartQty={cart.qtyOf(RESTAURANT, selectedItem.id)}
          onClose={() => setSelectedId(null)}
          onConfirm={(qty) => {
            cart.setQty(RESTAURANT, selectedItem.id, qty);
            setSelectedId(null);
          }}
        />
      )}
    </div>
  );
}
