import { getMenuItemsForRestaurant } from "@/lib/menu-data";
import AnjumMenuClient from "@/components/menu/AnjumMenuClient";

export const dynamic = "force-dynamic";

export default async function AnjumMenuPage() {
  const items = await getMenuItemsForRestaurant("anjum-kabab-ghor");
  return <AnjumMenuClient items={items} />;
}
