"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SearchBar from "@/components/menu/SearchBar";

type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  role: "ADMIN" | "MANAGER" | "RIDER" | "CUSTOMER";
  createdAt: string;
  managerRestaurants: { restaurant: { id: string; name: string } }[];
};

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  { value: "MANAGER", label: "Managers" },
  { value: "RIDER", label: "Riders" },
  { value: "CUSTOMER", label: "Customers" },
];

export default function ManageProfilesTable({
  basePath,
  allowedRoles,
}: {
  basePath: string;
  allowedRoles: string[];
}) {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (roleFilter !== "all") params.set("role", roleFilter);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const id = setTimeout(() => {
      fetch(`/api/users?${params.toString()}`)
        .then((res) => res.json())
        .then((data) => setUsers(data.users ?? []))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(id);
  }, [query, roleFilter]);

  const visibleRoleOptions = ROLE_OPTIONS.filter(
    (opt) => opt.value === "all" || allowedRoles.includes(opt.value),
  );

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="max-w-sm flex-1">
          <SearchBar value={query} onChange={setQuery} placeholder="Search by name or email" />
        </div>
        <div className="flex gap-2">
          {visibleRoleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRoleFilter(opt.value)}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                roleFilter === opt.value
                  ? "border-maroon bg-maroon text-cream"
                  : "border-maroon/20 bg-white/70 text-ink/70"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink/50">Loading profiles…</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`${basePath}/${user.id}`}
              className="flex items-center gap-4 rounded-xl border border-maroon/15 bg-white/60 p-4 transition-colors hover:bg-white/90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={user.avatarUrl || "/images/avatar-placeholder.svg"}
                alt={user.name}
                className="h-10 w-10 shrink-0 rounded-full object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{user.name}</p>
                <p className="truncate text-xs text-ink/50">{user.email}</p>
                {user.managerRestaurants.length > 0 && (
                  <p className="mt-0.5 text-xs text-maroon/70">
                    Manages: {user.managerRestaurants.map((m) => m.restaurant.name).join(", ")}
                  </p>
                )}
              </div>
              <span className="shrink-0 rounded-full bg-maroon/10 px-3 py-1 text-xs font-semibold text-maroon">
                {user.role}
              </span>
            </Link>
          ))}
          {users.length === 0 && <p className="text-sm text-ink/50">No profiles match.</p>}
        </div>
      )}
    </div>
  );
}
