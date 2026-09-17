"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import OrderAlerts from "@/components/manager-app/OrderAlerts";

export default function AppHeader({ userName }: { userName: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/app";

  async function logOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/app/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 bg-maroon text-cream shadow-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {!isHome && (
            <Link
              href="/app"
              aria-label="Back to home"
              className="flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold text-cream transition-colors hover:bg-cream/10"
            >
              <span aria-hidden="true">&larr;</span> Home
            </Link>
          )}
          <Link href="/app" className="flex min-w-0 items-center gap-2">
            <Image src="/app-icons/icon-192.png" alt="" width={28} height={28} className="rounded-md" />
            <span className="truncate font-serif text-base font-semibold">Food Mela Manager</span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <OrderAlerts />
          <span className="hidden text-xs text-cream/70 md:inline">{userName}</span>
          <button
            type="button"
            onClick={logOut}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-cream/80 transition-colors hover:bg-cream/10 hover:text-cream"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
