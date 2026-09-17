import ManagerOverview from "@/components/dashboard/ManagerOverview";
import { requireManagerForApp } from "@/app/app/require-manager";

export default async function ManagerAppOverviewPage() {
  const user = await requireManagerForApp();
  return <ManagerOverview userId={user.id} />;
}
