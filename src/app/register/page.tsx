"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import AvatarUpload from "@/components/AvatarUpload";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.set("name", name);
      fd.set("phone", phone);
      fd.set("address", address);
      fd.set("email", email);
      fd.set("password", password);
      if (avatar) fd.set("avatar", avatar);

      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(data.redirectTo ?? "/account");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <h1 className="text-center font-serif text-3xl font-semibold text-maroon">
        Create an Account
      </h1>
      <p className="mt-2 text-center text-sm text-ink/60">
        Customer accounts only — riders and restaurant managers are added by
        Food Mela staff.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        {error && (
          <p className="rounded-lg bg-maroon/10 px-3 py-2 text-sm text-maroon">{error}</p>
        )}

        <AvatarUpload onChange={setAvatar} />

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
          <span className="font-medium text-ink">Phone No.</span>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Address</span>
          <input
            type="text"
            required
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-ink">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
          />
        </label>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 w-full rounded-full bg-maroon py-3 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Register"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-maroon underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
