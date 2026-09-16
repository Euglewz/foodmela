import ProfileDetail from "@/components/dashboard/ProfileDetail";

export default async function AdminProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProfileDetail userId={id} basePath="/admin/profiles" mode="admin" />;
}
