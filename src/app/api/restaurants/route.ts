import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  const restaurants = await prisma.restaurant.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ restaurants });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") : "";
  if (!name || !slug) {
    return NextResponse.json({ error: "Name and slug are required." }, { status: 400 });
  }

  const existing = await prisma.restaurant.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "A restaurant with that slug already exists." }, { status: 409 });
  }

  const restaurant = await prisma.restaurant.create({
    data: {
      name,
      slug,
      description: typeof body?.description === "string" ? body.description : null,
    },
  });

  return NextResponse.json({ restaurant }, { status: 201 });
}
