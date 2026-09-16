import ProfileDetail from "@/components/dashboard/ProfileDetail";

export default async function ManagerProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfileDetail userId={id} basePath="/manager/profiles" mode="manager" />;
}
