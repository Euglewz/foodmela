import type { ReactNode } from "react";
import Sidebar from "@/components/dashboard/Sidebar";

const LINKS = [
  { href: "/rider", label: "My Orders", icon: "🧾" },
  { href: "/rider/history", label: "Delivery History", icon: "🛵" },
];

export default function RiderLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col md:flex-row">
      <Sidebar title="Rider Dashboard" links={LINKS} />
      <div className="w-full flex-1 px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
