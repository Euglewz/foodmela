"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import GoogleAuthButton from "@/components/GoogleAuthButton";

const NOT_A_MANAGER = "This app is only for restaurant managers.";

export default function AppLoginForm({
  googleError,
  signedInAs,
}: {
  googleError: string | null;
  signedInAs: { name: string; role: string } | null;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    googleError ?? (signedInAs ? `${NOT_A_MANAGER} You're signed in as ${signedInAs.name} (${signedInAs.role.toLowerCase()}).` : null),
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      if (data.user?.role !== "MANAGER") {
        await fetch("/api/auth/logout", { method: "POST" });
        setError(NOT_A_MANAGER);
        return;
      }
      router.replace("/app");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Image src="/app-icons/icon-192.png" alt="" width={72} height={72} className="rounded-2xl shadow" priority />
          <h1 className="mt-4 font-serif text-2xl font-semibold text-maroon">Food Mela Manager</h1>
          <p className="mt-1 text-sm text-ink/60">Log in with your manager account.</p>
        </div>

        {error && <p className="mt-6 rounded-lg bg-maroon/10 px-3 py-2 text-sm text-maroon">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-ink">Email</span>
            <input
              type="email"
              required
              autoComplete="username"
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-maroon/20 bg-white/70 px-3 py-2.5 text-sm text-ink focus:border-maroon focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-full bg-maroon py-3 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark disabled:opacity-60"
          >
            {submitting ? "Logging in…" : "Log In"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3 text-xs text-ink/40">
          <span className="h-px flex-1 bg-maroon/15" />
          or
          <span className="h-px flex-1 bg-maroon/15" />
        </div>
        <GoogleAuthButton label="Continue with Google" href="/api/auth/google?from=app" />
      </div>
    </div>
  );
}
