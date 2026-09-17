import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export async function requireManagerForApp() {
  const user = await getCurrentUser();
  if (!user || user.role !== "MANAGER") redirect("/app/login");
  return user;
}
