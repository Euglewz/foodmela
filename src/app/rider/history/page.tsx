import RiderOrders from "@/components/dashboard/RiderOrders";

export default function RiderHistoryPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">Delivery History</h1>
      <p className="mt-1 text-sm text-ink/60">Orders you&rsquo;ve delivered.</p>
      <div className="mt-6">
        <RiderOrders history />
      </div>
    </div>
  );
}
