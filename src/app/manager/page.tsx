import ManagerOverview from "@/components/dashboard/ManagerOverview";
import { requireRole } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ManagerOverviewPage() {
  const session = await requireRole("MANAGER");
  return <ManagerOverview userId={session.userId} />;
}
