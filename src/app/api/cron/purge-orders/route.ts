import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expiredOrdersWhere, ORDER_RETENTION_DAYS } from "@/lib/order-retention";

// Called once a day by Vercel Cron (see vercel.json). Vercel sends CRON_SECRET as a bearer token.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count } = await prisma.order.deleteMany({ where: expiredOrdersWhere() });
  return NextResponse.json({ deleted: count, retentionDays: ORDER_RETENTION_DAYS });
}
