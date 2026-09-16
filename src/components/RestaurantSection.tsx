import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

type RestaurantSectionProps = {
  name: string;
  tagline: string;
  description: string;
  imageSide: "left" | "right";
  imageSrc: string;
  menuHref: string;
};

export default function RestaurantSection({
  name,
  tagline,
  description,
  imageSide,
  imageSrc,
  menuHref,
}: RestaurantSectionProps) {
  const imageFirst = imageSide === "left";

  const fadeDirection = imageFirst ? "to right" : "to left";
  const fadeStyle: CSSProperties = {
    maskImage: `linear-gradient(${fadeDirection}, black 55%, transparent 100%)`,
    WebkitMaskImage: `linear-gradient(${fadeDirection}, black 55%, transparent 100%)`,
  };

  const photo = (
    <div className="relative h-72 w-full overflow-hidden sm:h-96 md:h-[28rem]" style={fadeStyle}>
      <Image
        src={imageSrc}
        alt={`${name} dishes`}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover"
      />
    </div>
  );

  const text = (
    <div className="flex w-full flex-col items-center justify-center px-6 py-10 text-center sm:px-10 md:px-14">
      <h2 className="font-serif text-3xl font-semibold text-maroon sm:text-4xl">
        {name}
      </h2>
      <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-maroon/70">
        {tagline}
      </p>
      <p className="mt-5 max-w-md text-base leading-relaxed text-ink/90">
        {description}
      </p>
      <Link
        href={menuHref}
        className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-maroon px-7 py-3 text-sm font-semibold tracking-wide text-cream transition-colors hover:bg-maroon-dark"
      >
        Explore Menu
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  );

  return (
    <section className="grid grid-cols-1 md:grid-cols-2">
      {imageFirst ? (
        <>
          {photo}
          {text}
        </>
      ) : (
        <>
          <div className="order-2 flex md:order-1">{text}</div>
          <div className="order-1 md:order-2">{photo}</div>
        </>
      )}
    </section>
  );
}
