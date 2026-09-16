import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Food Mela",
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-1 flex-col justify-center px-6 py-24">
      <h1 className="font-serif text-4xl font-semibold text-maroon">
        About Us
      </h1>
      <p className="mt-6 text-base leading-relaxed text-ink/80">
        Placeholder text — Food Mela was founded with a simple goal: bring
        authentic, home-style South Asian cooking to the community.
      </p>
      <p className="mt-4 text-base leading-relaxed text-ink/80">
        Placeholder text — every dish is prepared fresh daily using recipes
        passed down through generations, with a focus on quality ingredients
        and bold, authentic flavor.
      </p>
    </div>
  );
}
