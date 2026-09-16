"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAVBAR_HEIGHT_PX } from "@/lib/layout-constants";

export type SidebarLink = { href: string; label: string; icon: string };

export default function Sidebar({ title, links }: { title: string; links: SidebarLink[] }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar — always visible while in a dashboard section */}
      <aside
        className="sticky hidden w-64 shrink-0 flex-col overflow-y-auto bg-ink px-3 py-6 text-cream md:flex"
        style={{ top: NAVBAR_HEIGHT_PX, height: `calc(100vh - ${NAVBAR_HEIGHT_PX}px)` }}
      >
        <p className="px-3 pb-4 text-xs font-semibold tracking-widest text-cream/40 uppercase">
          {title}
        </p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => {
            const active = link.href === pathname;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gradient-to-r from-maroon to-maroon-dark text-cream shadow"
                    : "text-cream/70 hover:bg-cream/10 hover:text-cream"
                }`}
              >
                <span aria-hidden="true">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile: horizontal scrollable pill nav */}
      <nav className="flex gap-2 overflow-x-auto border-b border-maroon/15 bg-white/40 px-4 py-3 md:hidden">
        {links.map((link) => {
          const active = link.href === pathname;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                active ? "bg-maroon text-cream" : "bg-maroon/10 text-ink/70"
              }`}
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
