"use client";

import { useState, type FormEvent } from "react";
import Modal from "@/components/Modal";

const ALL_DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

export type MenuItemFormValue = {
  id?: string;
  restaurantId: string;
  name: string;
  description: string;
  price: string;
  category: string;
  availabilityDays: string[];
  availabilityStart: string;
  availabilityEnd: string;
  imageUrl: string | null;
};

export default function MenuItemModal({
  value,
  restaurants,
  onClose,
  onSave,
}: {
  value: MenuItemFormValue;
  restaurants: { id: string; name: string }[];
  onClose: () => void;
  onSave: (form: MenuItemFormValue, imageFile: File | null) => Promise<void>;
}) {
  const [form, setForm] = useState(value);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(value.imageUrl);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFile(file: File | null) {
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  }

  function toggleDay(day: string) {
    setForm((f) => ({
      ...f,
      availabilityDays: f.availabilityDays.includes(day)
        ? f.availabilityDays.filter((d) => d !== day)
        : [...f.availabilityDays, day],
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave(form, imageFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      <div className="max-h-[80vh] overflow-y-auto rounded-2xl bg-cream p-6">
        <h2 className="font-serif text-xl font-semibold text-maroon">
          {value.id ? "Edit Item" : "Add Item"}
        </h2>

        <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-4">
          {error && <p className="rounded-lg bg-maroon/10 px-3 py-2 text-sm text-maroon">{error}</p>}

          {!value.id && (
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Restaurant</span>
              <select
                required
                value={form.restaurantId}
                onChange={(e) => setForm((f) => ({ ...f, restaurantId: e.target.value }))}
                className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
              >
                <option value="" disabled>
                  Select a restaurant
                </option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Item Name</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Description</span>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </label>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Price (Tk)</span>
              <input
                type="number"
                min={0}
                step="1"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="Leave blank for market price"
                className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink placeholder:text-xs focus:border-maroon focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Category</span>
              <input
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </label>
          </div>

          <div>
            <span className="text-sm font-medium text-ink">Availability Days</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    form.availabilityDays.includes(day)
                      ? "border-maroon bg-maroon text-cream"
                      : "border-maroon/20 bg-white/70 text-ink/70"
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Available From</span>
              <input
                type="time"
                value={form.availabilityStart}
                onChange={(e) => setForm((f) => ({ ...f, availabilityStart: e.target.value }))}
                className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="font-medium text-ink">Available Until</span>
              <input
                type="time"
                value={form.availabilityEnd}
                onChange={(e) => setForm((f) => ({ ...f, availabilityEnd: e.target.value }))}
                className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
              />
            </label>
          </div>

          <div>
            <span className="text-sm font-medium text-ink">Item Image</span>
            <label
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFile(file);
              }}
              className={`mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                dragOver ? "border-maroon bg-maroon/5" : "border-maroon/25 bg-white/50"
              }`}
            >
              {imagePreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Preview" className="h-24 w-24 rounded-lg object-cover" />
              ) : (
                <p className="text-xs text-ink/50">Drag &amp; drop an image, or click to upload</p>
              )}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-maroon/20 py-2.5 text-sm font-semibold text-ink/70 transition-colors hover:bg-maroon/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-maroon py-2.5 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
