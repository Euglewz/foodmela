import ManageProfilesTable from "@/components/dashboard/ManageProfilesTable";

export default function ManagerAppProfilesPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">Manage Profiles</h1>
      <p className="mt-1 text-sm text-ink/60">
        Search riders and customers, check their activity, or promote a customer to Rider.
      </p>
      <div className="mt-6">
        <ManageProfilesTable basePath="/app/profiles" allowedRoles={["RIDER", "CUSTOMER"]} />
      </div>
    </div>
  );
}
