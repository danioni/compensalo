import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/**
 * GET /api/reconciliacion/cobros-pendientes
 * Searches pending PaymentRecords (cobros) for manual association.
 * Filters: organizationId (required), q (text search), amount (exact match).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const organizationId = searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }

  const q = searchParams.get("q")?.trim() ?? "";
  const amountParam = searchParams.get("amount");

  const where: Prisma.PaymentRecordWhereInput = {
    organizationId,
    status: { in: ["PENDING", "CONFIRMED"] },
  };

  // Text search on description or clientId
  if (q) {
    where.OR = [
      { description: { contains: q, mode: "insensitive" } },
      { clientId: { contains: q, mode: "insensitive" } },
    ];
  }

  // Exact amount filter
  if (amountParam) {
    const amt = parseInt(amountParam, 10);
    if (!isNaN(amt)) {
      where.amount = new Prisma.Decimal(amt);
    }
  }

  const payments = await prisma.paymentRecord.findMany({
    where,
    orderBy: { paidAt: "desc" },
    take: 20,
  });

  const result = payments.map((p) => ({
    id: p.id,
    externalId: p.externalId,
    source: p.source,
    amount: p.amount.toString(),
    currency: p.currency,
    paidAt: p.paidAt.toISOString(),
    description: p.description,
    clientId: p.clientId,
    status: p.status,
  }));

  return NextResponse.json(result);
}
