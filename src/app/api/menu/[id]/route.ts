import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { canManageRestaurant } from "@/lib/authz";
import { saveMenuImage } from "@/lib/upload";
import { logActivity } from "@/lib/activity";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await canManageRestaurant(session, existing.restaurantId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const contentType = request.headers.get("content-type") ?? "";
  const data: Record<string, unknown> = {};

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    const name = form.get("name");
    const description = form.get("description");
    const price = form.get("price");
    const category = form.get("category");
    const availabilityDays = form.get("availabilityDays");
    const availabilityStart = form.get("availabilityStart");
    const availabilityEnd = form.get("availabilityEnd");
    const isAvailable = form.get("isAvailable");
    const image = form.get("image");

    if (typeof name === "string") data.name = name.trim();
    if (typeof description === "string") data.description = description;
    if (typeof price === "string") data.price = price === "" ? null : Number(price);
    if (typeof category === "string" && category) data.category = category;
    if (typeof availabilityDays === "string") {
      try {
        data.availabilityDays = JSON.stringify(JSON.parse(availabilityDays));
      } catch {
        /* ignore malformed value */
      }
    }
    if (typeof availabilityStart === "string") data.availabilityStart = availabilityStart || null;
    if (typeof availabilityEnd === "string") data.availabilityEnd = availabilityEnd || null;
    if (typeof isAvailable === "string") data.isAvailable = isAvailable === "true";
    if (image instanceof File && image.size > 0) {
      data.imageUrl = await saveMenuImage(image);
    }
  } else {
    const body = await request.json().catch(() => null);
    if (body && typeof body === "object") {
      if (typeof body.name === "string") data.name = body.name.trim();
      if (typeof body.description === "string") data.description = body.description;
      if (body.price === null || typeof body.price === "number") data.price = body.price;
      if (typeof body.category === "string" && body.category) data.category = body.category;
      if (Array.isArray(body.availabilityDays)) data.availabilityDays = JSON.stringify(body.availabilityDays);
      if (typeof body.availabilityStart === "string" || body.availabilityStart === null) {
        data.availabilityStart = body.availabilityStart;
      }
      if (typeof body.availabilityEnd === "string" || body.availabilityEnd === null) {
        data.availabilityEnd = body.availabilityEnd;
      }
      if (typeof body.isAvailable === "boolean") data.isAvailable = body.isAvailable;
    }
  }

  const item = await prisma.menuItem.update({ where: { id }, data });
  await logActivity(
    session.userId,
    "MENU_ITEM_UPDATED",
    `${item.name}${"isAvailable" in data ? ` marked ${data.isAvailable ? "available" : "unavailable"}` : " edited"}`,
  );

  return NextResponse.json({ item });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "MANAGER")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await prisma.menuItem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!(await canManageRestaurant(session, existing.restaurantId))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.menuItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
