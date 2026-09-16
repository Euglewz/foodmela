import ManageProfilesTable from "@/components/dashboard/ManageProfilesTable";

export default function AdminProfilesPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-maroon">Manage Profiles</h1>
      <p className="mt-1 text-sm text-ink/60">
        Search for anyone to view their activity, promote them to Manager or Rider, or revert them to Customer.
      </p>
      <div className="mt-6">
        <ManageProfilesTable basePath="/admin/profiles" allowedRoles={["MANAGER", "RIDER", "CUSTOMER"]} />
      </div>
    </div>
  );
}
