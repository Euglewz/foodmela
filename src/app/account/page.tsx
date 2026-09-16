import { getCurrentUser, requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatTk } from "@/lib/currency";
import { ORDER_STATUS_COLOR, ORDER_STATUS_LABEL } from "@/lib/order-status";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  await requireRole("CUSTOMER");
  const user = await getCurrentUser();
  if (!user) return null;

  const orders = await prisma.order.findMany({
    where: { customerId: user.id },
    include: { items: true, restaurant: { select: { name: true } }, rider: { select: { name: true, phone: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.avatarUrl || "/images/avatar-placeholder.svg"}
          alt={user.name}
          className="h-16 w-16 rounded-full object-cover"
        />
        <h1 className="font-serif text-3xl font-semibold text-maroon">My Profile</h1>
      </div>

      <div className="mt-6 rounded-2xl border border-maroon/15 bg-white/60 p-6">
        <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="font-medium text-maroon">Name</dt>
            <dd className="text-ink/80">{user.name}</dd>
          </div>
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
        </dl>
      </div>

      <h2 className="mt-10 font-serif text-2xl font-semibold text-maroon">My Orders</h2>

      {orders.length === 0 ? (
        <p className="mt-4 text-sm text-ink/50">You haven&rsquo;t placed any orders yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border border-maroon/15 bg-white/60 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink">{order.restaurant.name}</p>
                  <p className="text-xs text-ink/50">
                    {new Date(order.createdAt).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${ORDER_STATUS_COLOR[order.status]}`}
                >
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </div>

              <ul className="mt-4 flex flex-col gap-1.5 border-t border-maroon/15 pt-4 text-sm">
                {order.items.map((line) => (
                  <li key={line.id} className="flex items-center justify-between gap-3">
                    <span className="text-ink/80">
                      {line.qty} × {line.name}
                    </span>
                    <span className="font-medium text-ink">{formatTk(line.price * line.qty)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex items-center justify-between border-t border-maroon/15 pt-4 text-sm">
                <span className="font-medium text-ink">Total</span>
                <span className="font-serif text-lg font-semibold text-maroon">{formatTk(order.total)}</span>
              </div>

              {order.rider &&
                (order.status === "DELIVERED" ? (
                  <p className="mt-2 text-xs text-ink/50">Delivered by: {order.rider.name}</p>
                ) : (
                  <p className="mt-2 text-xs text-ink/50">
                    Rider: {order.rider.name} ({order.rider.phone})
                  </p>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
