import ProfileDetail from "@/components/dashboard/ProfileDetail";

export default async function ManagerAppProfileDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProfileDetail userId={id} basePath="/app/profiles" mode="manager" />;
}
