import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface SummaryBucket {
  count: number;
  amount: number;
}

export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }

  const results = await prisma.reconciliationPosition.groupBy({
    by: ["status"],
    where: { organizationId },
    _count: { id: true },
    _sum: { amount: true },
  });

  const summary: Record<string, SummaryBucket> = {
    matched: { count: 0, amount: 0 },
    pending: { count: 0, amount: 0 },
    exception: { count: 0, amount: 0 },
  };

  for (const row of results) {
    const amount = row._sum.amount
      ? new Prisma.Decimal(row._sum.amount).toNumber()
      : 0;
    const count = row._count.id;

    switch (row.status) {
      case "MATCHED":
      case "SETTLED":
        summary.matched.count += count;
        summary.matched.amount += amount;
        break;
      case "UNMATCHED":
      case "PENDING_MATCH":
        summary.pending.count += count;
        summary.pending.amount += amount;
        break;
      case "EXCEPTION":
      case "DISPUTED":
        summary.exception.count += count;
        summary.exception.amount += amount;
        break;
    }
  }

  return NextResponse.json(summary);
}
