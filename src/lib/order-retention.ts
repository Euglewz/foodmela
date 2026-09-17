import type { OrderStatus, Prisma } from "@prisma/client";

export const ORDER_RETENTION_DAYS = 31;

const FINISHED_STATUSES: OrderStatus[] = ["DELIVERED", "CANCELLED"];

export function retentionCutoff(now = new Date()): Date {
  return new Date(now.getTime() - ORDER_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

// Unfinished orders are always kept; finished ones only for the retention window.
export function retainedOrdersWhere(): Prisma.OrderWhereInput {
  return { OR: [{ status: { notIn: FINISHED_STATUSES } }, { createdAt: { gte: retentionCutoff() } }] };
}

export function expiredOrdersWhere(): Prisma.OrderWhereInput {
  return { status: { in: FINISHED_STATUSES }, createdAt: { lt: retentionCutoff() } };
}
