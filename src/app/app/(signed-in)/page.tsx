import Link from "next/link";
import { requireManagerForApp } from "@/app/app/require-manager";

const OPTIONS = [
  { href: "/app/overview", label: "Dashboard Overview", icon: "📊" },
  { href: "/app/profiles", label: "Manage Profiles", icon: "👥" },
  { href: "/app/menu", label: "Manage Menu", icon: "🍽️" },
  { href: "/app/orders", label: "Manage Orders", icon: "🧾" },
];

export default async function ManagerAppHome() {
  const user = await requireManagerForApp();
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-6">
      <p className="text-sm text-ink/60">Welcome, {user.name}</p>
      <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
        {OPTIONS.map((option) => (
          <Link
            key={option.href}
            href={option.href}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-maroon/15 bg-white/70 px-6 py-10 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-maroon/40 hover:bg-white hover:shadow-md"
          >
            <span aria-hidden="true" className="text-4xl">
              {option.icon}
            </span>
            <span className="font-serif text-xl font-semibold text-maroon">{option.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
