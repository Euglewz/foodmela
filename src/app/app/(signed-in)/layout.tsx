import AppHeader from "@/components/manager-app/AppHeader";
import { requireManagerForApp } from "@/app/app/require-manager";

export const dynamic = "force-dynamic";

export default async function ManagerAppSignedInLayout({ children }: { children: React.ReactNode }) {
  const user = await requireManagerForApp();
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader userName={user.name} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
