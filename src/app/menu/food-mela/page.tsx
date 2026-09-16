import { getMenuItemsForRestaurant } from "@/lib/menu-data";
import FoodMelaMenuClient from "@/components/menu/FoodMelaMenuClient";

export const dynamic = "force-dynamic";

export default async function FoodMelaMenuPage() {
  const items = await getMenuItemsForRestaurant("food-mela");
  return <FoodMelaMenuClient items={items} />;
}
