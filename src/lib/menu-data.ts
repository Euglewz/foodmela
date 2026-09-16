import { prisma } from "@/lib/prisma";
import type { MenuItemDTO } from "@/lib/menu-types";

export async function getMenuItemsForRestaurant(slug: string): Promise<MenuItemDTO[]> {
  const items = await prisma.menuItem.findMany({
    where: { restaurant: { slug } },
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: item.price,
    imageUrl: item.imageUrl,
    category: item.category,
    availabilityDays: JSON.parse(item.availabilityDays) as string[],
    availabilityStart: item.availabilityStart,
    availabilityEnd: item.availabilityEnd,
    isAvailable: item.isAvailable,
  }));
}
