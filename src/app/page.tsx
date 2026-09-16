import Image from "next/image";
import Link from "next/link";
import RestaurantSection from "@/components/RestaurantSection";

const FEATURES = [
  {
    title: "Authentic Recipes",
    description:
      "Placeholder text — dishes made from family recipes passed down for generations.",
  },
  {
    title: "Fresh Ingredients",
    description:
      "Placeholder text — sourced daily from trusted local markets and suppliers.",
  },
  {
    title: "Fast Delivery",
    description:
      "Placeholder text — hot, fresh orders delivered straight to your door.",
  },
];

const LOCATIONS = [
  {
    name: "Food Mela",
    address: "123 Curry Lane, Your City",
    hours: "Mon–Sun: 11am – 10pm",
    phone: "(000) 000-0001",
  },
  {
    name: "Anjum Kabab Ghor",
    address: "456 Kabab Street, Your City",
    hours: "Mon–Sun: 12pm – 11pm",
    phone: "(000) 000-0002",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/*
        Hero — always scales to fill the full width with no horizontal gaps
        (source image is 1672x941). On mobile the section matches that aspect
        ratio exactly, so nothing is cropped and no vertical gap shows either.
        On desktop (sm+) the section is capped near the viewport height, so
        wide screens crop the image vertically rather than leaving side gaps —
        it's fine if the section below the info bar peeks into view a little
        (NAVBAR_HEIGHT_PX must match the "72px" below).
      */}
      <div className="flex flex-col sm:h-[calc(100vh-72px)]">
        <section className="relative aspect-[1672/941] w-full bg-cream sm:aspect-auto sm:min-h-0 sm:flex-1">
          <Image
            src="/images/hero_img.png"
            alt="Food Mela — traditional Bengali platter meals"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </section>
        <div className="flex shrink-0 flex-col items-center gap-4 bg-maroon px-6 py-6 text-center sm:flex-row sm:justify-center sm:gap-8">
          <p className="text-sm font-medium tracking-wide text-cream/90">
            Home of Food Mela &amp; Anjum Kabab Ghor
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/menu/food-mela"
              className="rounded-full bg-cream px-5 py-2 text-sm font-semibold text-maroon transition-colors hover:bg-white"
            >
              Order Food Mela
            </Link>
            <Link
              href="/menu/anjum-kabab-ghor"
              className="rounded-full border border-cream/60 px-5 py-2 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              Order Anjum Kabab Ghor
            </Link>
          </div>
        </div>
      </div>

      <RestaurantSection
        name="Food Mela"
        tagline="Bengali rice & fish specialties"
        description="Placeholder text — Food Mela is a restaurant serving traditional Bengali rice and fish dishes, made fresh daily with recipes rooted in home-style cooking. Come taste the comfort of authentic Bengali flavors."
        imageSide="left"
        imageSrc="/images/food_mela_home_page_img.png"
        menuHref="/menu/food-mela"
      />

      <RestaurantSection
        name="Anjum Kabab Ghor"
        tagline="Chargrilled kababs & grill specialties"
        description="Placeholder text — Anjum Kabab Ghor serves smoky, chargrilled kababs and grill favorites, packed with bold spice and flame-cooked flavor. A must-try for kabab lovers."
        imageSide="right"
        imageSrc="/images/anjum_kabab_home_page_img.png"
        menuHref="/menu/anjum-kabab-ghor"
      />

      {/* Feature strip */}
      <section className="bg-maroon py-14 text-cream">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-10 px-6 sm:grid-cols-3">
          {FEATURES.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-cream/40">
                <span className="font-serif text-xl">
                  {feature.title.charAt(0)}
                </span>
              </div>
              <h3 className="mt-4 font-serif text-lg font-semibold">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-cream/80">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Order online CTA */}
      <section className="bg-cream py-16">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-6 text-center">
          <h2 className="font-serif text-3xl font-semibold text-maroon sm:text-4xl">
            Order Online, Delivered Fresh
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-ink/80">
            Placeholder text — online ordering is coming soon for both Food
            Mela and Anjum Kabab Ghor. Skip the line and get your favorite
            dishes delivered straight to your door.
          </p>
          <Link
            href="/menu"
            className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-maroon px-8 py-3 text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-maroon-dark"
          >
            View Menu
          </Link>
        </div>
      </section>

      {/* Locations */}
      <section className="border-t border-maroon/15 bg-cream py-16">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center font-serif text-3xl font-semibold text-maroon sm:text-4xl">
            Visit Us
          </h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2">
            {LOCATIONS.map((location) => (
              <div
                key={location.name}
                className="rounded-2xl border border-maroon/20 bg-maroon/5 p-8"
              >
                <h3 className="font-serif text-xl font-semibold text-maroon">
                  {location.name}
                </h3>
                <dl className="mt-4 space-y-2 text-sm text-ink/80">
                  <div className="flex gap-2">
                    <dt className="font-medium text-maroon">Address:</dt>
                    <dd>{location.address}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium text-maroon">Hours:</dt>
                    <dd>{location.hours}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="font-medium text-maroon">Phone:</dt>
                    <dd>{location.phone}</dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
