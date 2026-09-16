import { NextResponse } from "next/server";
import { getMenuItemsForRestaurant } from "@/lib/menu-data";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "slug is required" }, { status: 400 });

  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await getMenuItemsForRestaurant(slug);
  return NextResponse.json({
    restaurant: { id: restaurant.id, name: restaurant.name, slug: restaurant.slug },
    items: items.map((i) => ({ id: i.id, name: i.name, price: i.price, isAvailable: i.isAvailable })),
  });
}
