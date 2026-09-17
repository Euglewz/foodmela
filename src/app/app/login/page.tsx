import { redirect } from "next/navigation";
import AppLoginForm from "@/components/manager-app/AppLoginForm";
import { googleErrorMessage } from "@/components/GoogleAuthButton";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ManagerAppLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await getCurrentUser();
  if (user?.role === "MANAGER") redirect("/app");

  const { error } = await searchParams;
  return (
    <AppLoginForm
      googleError={googleErrorMessage(error)}
      signedInAs={user ? { name: user.name, role: user.role } : null}
    />
  );
}
