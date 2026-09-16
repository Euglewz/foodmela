import RiderOrders from "@/components/dashboard/RiderOrders";

export default function RiderOrdersPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">My Orders</h1>
      <p className="mt-1 text-sm text-ink/60">Orders currently assigned to you.</p>
      <div className="mt-6">
        <RiderOrders />
      </div>
    </div>
  );
}
