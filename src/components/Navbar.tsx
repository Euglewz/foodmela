"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAVBAR_HEIGHT_PX } from "@/lib/layout-constants";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact Us" },
];

const DASHBOARD_PATH: Record<string, string> = {
  ADMIN: "/admin",
  MANAGER: "/manager",
  RIDER: "/rider",
  CUSTOMER: "/account",
};

type SessionUser = {
  name: string;
  role: keyof typeof DASHBOARD_PATH;
  avatarUrl: string | null;
};

function AvatarImg({ user, className }: { user: SessionUser | null; className: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={user?.avatarUrl || "/images/avatar-placeholder.svg"}
      alt={user?.name ?? "Profile"}
      className={className}
    />
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<SessionUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // Re-check the session on every route change so login/register/logout
    // (client-side navigations) update the navbar without a full reload.
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setMenuOpen(false);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className="sticky top-0 z-50 bg-maroon text-cream shadow-md"
      style={{ height: NAVBAR_HEIGHT_PX }}
    >
      <div
        className="mx-auto flex h-full max-w-6xl items-center justify-between px-4 sm:px-6"
      >
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-cream p-1.5 sm:h-12 sm:w-12">
            <Image
              src="/images/food_mela_logo.png"
              alt="Food Mela logo"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              priority
            />
          </span>
          <span className="font-serif text-lg font-semibold tracking-wide sm:text-xl">
            Food Mela
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium tracking-wide text-cream/90 transition-colors hover:text-cream hover:underline underline-offset-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={menuOpen}
                className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-cream/60 transition-colors hover:border-cream"
              >
                <AvatarImg user={user} className="h-full w-full object-cover" />
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-maroon/15 bg-white text-ink shadow-lg">
                  <div className="border-b border-maroon/10 px-4 py-3">
                    <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
                    <p className="text-xs text-ink/50">{user.role}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink/80 transition-colors hover:bg-maroon/5"
                  >
                    My Profile
                  </Link>
                  <Link
                    href={DASHBOARD_PATH[user.role]}
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-ink/80 transition-colors hover:bg-maroon/5"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full border-t border-maroon/10 px-4 py-2.5 text-left text-sm font-medium text-maroon transition-colors hover:bg-maroon/5"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium tracking-wide text-cream/90 transition-colors hover:text-cream hover:underline underline-offset-4"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-cream px-5 py-2 text-sm font-semibold text-maroon transition-colors hover:bg-white"
              >
                Register
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span
            className={`h-0.5 w-6 bg-cream transition-transform ${open ? "translate-y-2 rotate-45" : ""}`}
          />
          <span className={`h-0.5 w-6 bg-cream transition-opacity ${open ? "opacity-0" : ""}`} />
          <span
            className={`h-0.5 w-6 bg-cream transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {open && (
        <nav className="flex flex-col gap-1 border-t border-cream/20 px-4 pb-4 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2.5 text-sm font-medium text-cream/90 transition-colors hover:bg-cream/10 hover:text-cream"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-cream/20 pt-3">
            {user ? (
              <>
                <div className="flex items-center gap-3 px-2 py-2">
                  <AvatarImg user={user} className="h-9 w-9 rounded-full border border-cream/40 object-cover" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-cream">{user.name}</p>
                    <p className="text-xs text-cream/60">{user.role}</p>
                  </div>
                </div>
                <Link
                  href="/profile"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-center text-sm font-medium text-cream/90 transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  My Profile
                </Link>
                <Link
                  href={DASHBOARD_PATH[user.role]}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-center text-sm font-medium text-cream/90 transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full bg-cream px-2 py-2.5 text-center text-sm font-semibold text-maroon transition-colors hover:bg-white"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2.5 text-center text-sm font-medium text-cream/90 transition-colors hover:bg-cream/10 hover:text-cream"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-full bg-cream px-2 py-2.5 text-center text-sm font-semibold text-maroon transition-colors hover:bg-white"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
