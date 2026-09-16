"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  avatarUrl: string | null;
  role: "ADMIN" | "MANAGER" | "RIDER" | "CUSTOMER";
  createdAt: string;
  managerRestaurants: { restaurant: { id: string; name: string } }[];
};

type ActivityEntry = { id: string; action: string; detail: string | null; createdAt: string };

export default function ProfileDetail({
  userId,
  basePath,
  mode,
}: {
  userId: string;
  basePath: string;
  mode: "admin" | "manager";
}) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [stats, setStats] = useState<{ ordersPlaced: number; ordersDelivered: number } | null>(null);
  const [restaurants, setRestaurants] = useState<{ id: string; name: string }[]>([]);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/users/${userId}`);
    if (res.ok) {
      const data = await res.json();
      setUser(data.user);
      setActivity(data.activity);
      setStats(data.stats);
      setSelectedRestaurants(data.user.managerRestaurants.map((m: { restaurant: { id: string } }) => m.restaurant.id));
    }
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (mode === "admin") {
      fetch("/api/restaurants")
        .then((res) => res.json())
        .then((data) => setRestaurants(data.restaurants ?? []));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function changeRole(role: string, restaurantIds?: string[]) {
    const ROLE_RANK: Record<string, number> = { CUSTOMER: 0, RIDER: 1, MANAGER: 2, ADMIN: 3 };
    if (user && ROLE_RANK[role] < ROLE_RANK[user.role]) {
      const ok = window.confirm(
        `Demote ${user.name} from ${user.role.toLowerCase()} to ${role.toLowerCase()}? They will lose access to the ${user.role.toLowerCase()} dashboard.`,
      );
      if (!ok) return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, restaurantIds }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not update role.");
        return;
      }
      await load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-ink/50">Loading…</p>;
  if (!user) return <p className="text-sm text-ink/50">Profile not found.</p>;

  return (
    <div>
      <Link href={basePath} className="text-sm font-medium text-maroon underline">
        &larr; Back to profiles
      </Link>

      <div className="mt-4 rounded-2xl border border-maroon/15 bg-white/60 p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={user.avatarUrl || "/images/avatar-placeholder.svg"}
              alt={user.name}
              className="h-14 w-14 rounded-full object-cover"
            />
            <div>
              <h1 className="font-serif text-2xl font-semibold text-maroon">{user.name}</h1>
              <p className="text-sm text-ink/60">{user.email}</p>
            </div>
          </div>
          <span className="rounded-full bg-maroon/10 px-3 py-1 text-xs font-semibold text-maroon">
            {user.role}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-maroon">Phone</dt>
            <dd className="text-ink/80">{user.phone ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-maroon">Address</dt>
            <dd className="text-ink/80">{user.address ?? "—"}</dd>
          </div>
          <div>
            <dt className="font-medium text-maroon">Joined</dt>
            <dd className="text-ink/80">{new Date(user.createdAt).toLocaleDateString()}</dd>
          </div>
          {user.managerRestaurants.length > 0 && (
            <div>
              <dt className="font-medium text-maroon">Manages</dt>
              <dd className="text-ink/80">
                {user.managerRestaurants.map((m) => m.restaurant.name).join(", ")}
              </dd>
            </div>
          )}
        </dl>

        {stats && (
          <div className="mt-4 flex gap-6 border-t border-maroon/15 pt-4 text-sm">
            <p>
              <span className="font-semibold text-maroon">{stats.ordersPlaced}</span>{" "}
              <span className="text-ink/60">orders placed</span>
            </p>
            <p>
              <span className="font-semibold text-maroon">{stats.ordersDelivered}</span>{" "}
              <span className="text-ink/60">deliveries completed</span>
            </p>
          </div>
        )}
      </div>

      {error && <p className="mt-4 rounded-lg bg-maroon/10 px-3 py-2 text-sm text-maroon">{error}</p>}

      {user.role !== "ADMIN" && (
        <div className="mt-6 rounded-2xl border border-maroon/15 bg-white/60 p-6">
          <h2 className="font-serif text-lg font-semibold text-maroon">Manage Role</h2>

          <div className="mt-4 flex flex-wrap gap-3">
            {mode === "admin" && (
              <>
                {user.role !== "RIDER" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => changeRole("RIDER")}
                    className="rounded-full border border-maroon/20 px-4 py-2 text-sm font-semibold text-maroon transition-colors hover:bg-maroon/5 disabled:opacity-50"
                  >
                    {user.role === "MANAGER" ? "Demote to Rider" : "Promote to Rider"}
                  </button>
                )}
                {user.role !== "CUSTOMER" && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => changeRole("CUSTOMER")}
                    className="rounded-full border border-maroon/20 px-4 py-2 text-sm font-semibold text-ink/60 transition-colors hover:bg-maroon/5 disabled:opacity-50"
                  >
                    Demote to Customer
                  </button>
                )}
              </>
            )}
            {mode === "manager" && user.role !== "RIDER" && (
              <button
                type="button"
                disabled={saving}
                onClick={() => changeRole("RIDER")}
                className="rounded-full border border-maroon/20 px-4 py-2 text-sm font-semibold text-maroon transition-colors hover:bg-maroon/5 disabled:opacity-50"
              >
                Promote to Rider
              </button>
            )}
            {mode === "manager" && user.role === "RIDER" && (
              <button
                type="button"
                disabled={saving}
                onClick={() => changeRole("CUSTOMER")}
                className="rounded-full border border-maroon/20 px-4 py-2 text-sm font-semibold text-ink/60 transition-colors hover:bg-maroon/5 disabled:opacity-50"
              >
                Demote to Customer
              </button>
            )}
          </div>

          {mode === "admin" && (
            <div className="mt-5 border-t border-maroon/15 pt-4">
              <p className="text-sm font-medium text-ink">
                {user.role === "MANAGER" ? "Manages:" : "Promote to Manager for:"}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {restaurants.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() =>
                      setSelectedRestaurants((prev) =>
                        prev.includes(r.id) ? prev.filter((id) => id !== r.id) : [...prev, r.id],
                      )
                    }
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedRestaurants.includes(r.id)
                        ? "border-maroon bg-maroon text-cream"
                        : "border-maroon/20 bg-white/70 text-ink/70"
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
              <button
                type="button"
                disabled={saving || selectedRestaurants.length === 0}
                onClick={() => changeRole("MANAGER", selectedRestaurants)}
                className="mt-3 rounded-full bg-maroon px-4 py-2 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark disabled:opacity-50"
              >
                {user.role === "MANAGER" ? "Update Restaurants" : "Promote to Manager"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-maroon/15 bg-white/60 p-6">
        <h2 className="font-serif text-lg font-semibold text-maroon">Activity</h2>
        {activity.length === 0 ? (
          <p className="mt-2 text-sm text-ink/50">No activity recorded yet.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2 text-sm">
            {activity.map((entry) => (
              <li key={entry.id} className="flex justify-between gap-3 border-b border-maroon/10 pb-2">
                <div>
                  <p className="font-medium text-ink">{entry.action.replaceAll("_", " ")}</p>
                  {entry.detail && <p className="text-xs text-ink/50">{entry.detail}</p>}
                </div>
                <span className="shrink-0 text-xs text-ink/40">
                  {new Date(entry.createdAt).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
