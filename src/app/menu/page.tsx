import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Menu | Food Mela",
};

const RESTAURANTS = [
  {
    name: "Food Mela",
    description: "Bengali rice & fish specialties, organized by day and budget.",
    href: "/menu/food-mela",
    image: "/images/food_mela_home_page_img.png",
  },
  {
    name: "Anjum Kabab Ghor",
    description: "Chargrilled kababs, naan & porota, served midday through evening.",
    href: "/menu/anjum-kabab-ghor",
    image: "/images/anjum_kabab_home_page_img.png",
  },
];

export default function MenuIndexPage() {
  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6">
      <h1 className="text-center font-serif text-4xl font-semibold text-maroon">
        Choose a Menu
      </h1>
      <p className="mx-auto mt-3 max-w-md text-center text-sm text-ink/70">
        Select a restaurant to see its full menu and start your order.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {RESTAURANTS.map((restaurant) => (
          <Link
            key={restaurant.href}
            href={restaurant.href}
            className="group overflow-hidden rounded-2xl border border-maroon/15 bg-white/50 transition-shadow hover:shadow-lg"
          >
            <div className="relative h-40 w-full overflow-hidden">
              <Image
                src={restaurant.image}
                alt={restaurant.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-5">
              <h2 className="font-serif text-xl font-semibold text-maroon">
                {restaurant.name}
              </h2>
              <p className="mt-1 text-sm text-ink/70">{restaurant.description}</p>
              <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-maroon">
                View menu <span aria-hidden="true">&rarr;</span>
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
