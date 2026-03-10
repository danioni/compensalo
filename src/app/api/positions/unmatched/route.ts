import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const organizationId = request.nextUrl.searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }

  const positions = await prisma.reconciliationPosition.findMany({
    where: {
      organizationId,
      status: "UNMATCHED",
    },
    orderBy: { date: "desc" },
  });

  const result = positions.map((p) => ({
    ...p,
    amount: p.amount.toString(),
    isFirstTime: !p.suggestedClientName,
  }));

  return NextResponse.json(result);
}
