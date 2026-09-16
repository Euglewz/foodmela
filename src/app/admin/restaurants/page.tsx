"use client";

import { useEffect, useState, type FormEvent } from "react";

type Restaurant = { id: string; name: string; slug: string; description: string | null };

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/restaurants");
    const data = await res.json();
    setRestaurants(data.restaurants ?? []);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/restaurants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not add restaurant.");
        return;
      }
      setName("");
      setDescription("");
      await load();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">Restaurants</h1>
      <p className="mt-1 text-sm text-ink/60">
        Add a new restaurant so it can be assigned to managers and given its own menu.
      </p>

      <div className="mt-6 flex flex-col gap-2">
        {restaurants.map((r) => (
          <div key={r.id} className="rounded-xl border border-maroon/15 bg-white/60 p-4">
            <p className="font-medium text-ink">{r.name}</p>
            <p className="text-xs text-ink/50">/{r.slug}</p>
            {r.description && <p className="mt-1 text-xs text-ink/60">{r.description}</p>}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 rounded-2xl border border-maroon/15 bg-white/60 p-6 sm:max-w-md">
        <h2 className="font-serif text-lg font-semibold text-maroon">Add Restaurant</h2>
        {error && <p className="rounded-lg bg-maroon/10 px-3 py-2 text-sm text-maroon">{error}</p>}
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Name</span>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Description</span>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-full bg-maroon py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add Restaurant"}
        </button>
      </form>
    </div>
  );
}
