import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-maroon text-cream">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:justify-between">
        <div>
          <p className="font-serif text-xl font-semibold">Food Mela</p>
          <p className="mt-2 max-w-xs text-sm text-cream/80">
            Home of Food Mela &amp; Anjum Kabab Ghor — placeholder address, 123
            Curry Lane, Your City.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold tracking-wide text-cream">Explore</p>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              <li>
                <Link href="/" className="hover:text-cream hover:underline">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-cream hover:underline">
                  Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-cream hover:underline">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cream hover:underline">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-wide text-cream">Hours</p>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              <li>Mon–Fri: 11am – 10pm</li>
              <li>Sat–Sun: 12pm – 11pm</li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold tracking-wide text-cream">Contact</p>
            <ul className="mt-3 space-y-2 text-sm text-cream/80">
              <li>(000) 000-0000</li>
              <li>hello@foodmela.example</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-cream/20 px-4 py-4 text-center text-xs text-cream/70 sm:px-6">
        © {new Date().getFullYear()} Food Mela. All rights reserved.
      </div>
    </footer>
  );
}
