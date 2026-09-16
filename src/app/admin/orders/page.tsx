import OrdersManager from "@/components/dashboard/OrdersManager";

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">Manage Orders</h1>
      <p className="mt-1 text-sm text-ink/60">Track current orders and browse order history across both restaurants.</p>
      <div className="mt-6">
        <OrdersManager />
      </div>
    </div>
  );
}
