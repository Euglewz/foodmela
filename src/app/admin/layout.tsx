import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import { requireRole } from "@/lib/session";

const LINKS = [
  { href: "/admin", label: "Dashboard Overview", icon: "📊" },
  { href: "/admin/profiles", label: "Manage Profiles", icon: "👥" },
  { href: "/admin/menu", label: "Manage Menu", icon: "🍽️" },
  { href: "/admin/orders", label: "Manage Orders", icon: "🧾" },
  { href: "/admin/restaurants", label: "Restaurants", icon: "🏬" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireRole("ADMIN");
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <Sidebar title="Admin Dashboard" links={LINKS} />
      <div className="w-full flex-1 px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
