"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function ProfileEditor({
  initial,
}: {
  initial: { name: string; phone: string; address: string };
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [address, setAddress] = useState(initial.address);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function cancel() {
    setName(initial.name);
    setPhone(initial.phone);
    setAddress(initial.address);
    setError(null);
    setEditing(false);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save your profile.");
        return;
      }
      setEditing(false);
      setSaved(true);
      router.refresh();
    } catch {
      setError("Could not save your profile. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="mt-6 flex flex-col items-center gap-2">
        {saved && <p className="text-sm text-maroon">Profile updated.</p>}
        <button
          type="button"
          onClick={() => {
            setSaved(false);
            setEditing(true);
          }}
          className="rounded-full border border-maroon/20 px-6 py-2.5 text-sm font-semibold text-maroon transition-colors hover:bg-maroon/5"
        >
          Edit profile
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 rounded-2xl border border-maroon/15 bg-white/60 p-6">
      <h2 className="font-serif text-lg font-semibold text-maroon">Edit profile</h2>
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
        <span className="font-medium text-ink">Phone</span>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
        />
      </label>

      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-ink">Address</span>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
        />
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 rounded-full bg-maroon py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={cancel}
          className="rounded-full border border-maroon/20 px-5 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:bg-maroon/5"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
