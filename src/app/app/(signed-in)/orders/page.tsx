import OrdersManager from "@/components/dashboard/OrdersManager";

export default function ManagerAppOrdersPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">Manage Orders</h1>
      <p className="mt-1 text-sm text-ink/60">Current orders and history for your restaurant(s).</p>
      <div className="mt-6">
        <OrdersManager canMarkDelivery={false} printReceipts />
      </div>
    </div>
  );
}
