"use client";

import { useState } from "react";
import {
  AFTERNOON_SUBCATEGORIES,
  ANJUM_CATEGORY_WINDOW,
  ANJUM_TOP_TABS,
  type AnjumCategory,
  type AnjumTopTab,
} from "@/lib/anjum-menu";
import { scheduleLabelFor, type MenuItemDTO } from "@/lib/menu-types";
import { useCartContext } from "@/lib/cart-context";
import MenuTabs from "@/components/menu/MenuTabs";
import SearchBar from "@/components/menu/SearchBar";
import MenuItemCard from "@/components/menu/MenuItemCard";
import MenuAccordionSection from "@/components/menu/MenuAccordionSection";
import CartPanel from "@/components/menu/CartPanel";

const RESTAURANT = "anjum-kabab-ghor" as const;

export default function AnjumMenuClient({ items }: { items: MenuItemDTO[] }) {
  const [activeTab, setActiveTab] = useState<AnjumTopTab>("Midday");
  const [openSections, setOpenSections] = useState<Record<AnjumCategory, boolean>>({
    Midday: true,
    Kabab: false,
    "Ruti / Porota": false,
  });
  const [query, setQuery] = useState("");
  const cart = useCartContext();

  const itemsFor = (category: AnjumCategory) =>
    items.filter(
      (item) =>
        item.category === category &&
        item.name.toLowerCase().includes(query.toLowerCase()),
    );

  const cartLines = items
    .filter((item) => cart.qtyOf(RESTAURANT, item.id) > 0)
    .map((item) => ({
      id: item.id,
      name: item.name,
      price: item.price ?? 0,
      qty: cart.qtyOf(RESTAURANT, item.id),
    }));

  function renderItem(item: MenuItemDTO) {
    return (
      <MenuItemCard
        key={item.id}
        name={item.name}
        price={item.price}
        imageUrl={item.imageUrl}
        qty={cart.qtyOf(RESTAURANT, item.id)}
        available={item.isAvailable}
        scheduleLabel={scheduleLabelFor(item)}
        onAdd={() => cart.increment(RESTAURANT, item.id)}
        onIncrement={() => cart.increment(RESTAURANT, item.id)}
        onDecrement={() => cart.decrement(RESTAURANT, item.id)}
      />
    );
  }

  const middayItems = itemsFor("Midday");

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-maroon">
          Anjum Kabab Ghor Menu
        </h1>
        <p className="mt-1 text-sm text-ink/60">
          Each menu has its own usual ordering window — for this
          demonstration, every item can be added to your cart at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="mb-4">
            <SearchBar value={query} onChange={setQuery} placeholder="Search the menu" />
          </div>

          <MenuTabs tabs={ANJUM_TOP_TABS} active={activeTab} onChange={setActiveTab} />

          {activeTab === "Midday" ? (
            <>
              <div className="mt-4 rounded-lg bg-maroon/10 px-4 py-2 text-xs font-medium text-maroon">
                Midday ordering window: {ANJUM_CATEGORY_WINDOW.Midday.label}
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {middayItems.map(renderItem)}
                {middayItems.length === 0 && (
                  <p className="text-sm text-ink/50">No items match your search.</p>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="mt-4 rounded-lg bg-maroon/10 px-4 py-2 text-xs font-medium text-maroon">
                Afternoon/Evening ordering window: {ANJUM_CATEGORY_WINDOW.Kabab.label}
              </div>

              <div className="mt-4 flex flex-col gap-3">
                {AFTERNOON_SUBCATEGORIES.map(({ category, label }) => {
                  const catItems = itemsFor(category);
                  return (
                    <MenuAccordionSection
                      key={category}
                      label={label}
                      itemCount={catItems.length}
                      isOpen={openSections[category] || (query !== "" && catItems.length > 0)}
                      onToggle={() =>
                        setOpenSections((prev) => ({
                          ...prev,
                          [category]: !prev[category],
                        }))
                      }
                    >
                      {catItems.length > 0 ? (
                        catItems.map(renderItem)
                      ) : (
                        <p className="text-sm text-ink/50">No items match your search.</p>
                      )}
                    </MenuAccordionSection>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <CartPanel
          restaurantName="Anjum Kabab Ghor"
          restaurantSlug={RESTAURANT}
          lines={cartLines}
          onIncrement={(id) => cart.increment(RESTAURANT, id)}
          onDecrement={(id) => cart.decrement(RESTAURANT, id)}
        />
      </div>
    </div>
  );
}
