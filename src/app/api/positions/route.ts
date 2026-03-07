import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PositionStatus } from "@prisma/client";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const organizationId = searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }

  const status = searchParams.get("status") as PositionStatus | null;
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const where: {
    organizationId: string;
    status?: PositionStatus;
    date?: { gte?: Date; lte?: Date };
  } = { organizationId };

  if (status) {
    where.status = status;
  }

  if (from || to) {
    where.date = {};
    if (from) where.date.gte = new Date(from);
    if (to) where.date.lte = new Date(to);
  }

  const positions = await prisma.reconciliationPosition.findMany({
    where,
    include: {
      matchedPayment: true,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(positions);
}
