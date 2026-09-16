import ManageMenuTable from "@/components/dashboard/ManageMenuTable";

export default function AdminMenuPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">Manage Menu</h1>
      <p className="mt-1 text-sm text-ink/60">
        Search for an item to edit it, or tick availability on/off instantly.
      </p>
      <div className="mt-6">
        <ManageMenuTable />
      </div>
    </div>
  );
}
