import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";

const LINKS = [
  { href: "/manager", label: "Dashboard Overview", icon: "📊" },
  { href: "/manager/profiles", label: "Manage Profiles", icon: "👥" },
  { href: "/manager/menu", label: "Manage Menu", icon: "🍽️" },
  { href: "/manager/orders", label: "Manage Orders", icon: "🧾" },
];

export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <Sidebar title="Manager Dashboard" links={LINKS} />
      <div className="w-full flex-1 px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
