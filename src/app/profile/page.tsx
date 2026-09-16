import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { dashboardPathForRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/profile");

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-16">
      <div className="flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl || "/images/avatar-placeholder.svg"}
          alt={user.name}
          className="h-28 w-28 rounded-full border-4 border-maroon/15 object-cover"
        />
        <h1 className="text-center font-serif text-2xl font-semibold text-maroon">{user.name}</h1>
        <span className="rounded-full bg-maroon/10 px-3 py-1 text-xs font-semibold text-maroon">
          {user.role}
        </span>
      </div>

      <div className="mt-8 rounded-2xl border border-maroon/15 bg-white/60 p-6">
        <dl className="grid grid-cols-1 gap-3 text-sm">
          <div>
            <dt className="font-medium text-maroon">Email</dt>
            <dd className="text-ink/80">{user.email}</dd>
          </div>
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
        </dl>
      </div>

      <Link
        href={dashboardPathForRole(user.role)}
        className="mt-6 inline-flex w-fit items-center gap-2 self-center rounded-full bg-maroon px-7 py-3 text-sm font-semibold text-cream transition-colors hover:bg-maroon-dark"
      >
        Go to Dashboard
      </Link>
    </div>
  );
}
