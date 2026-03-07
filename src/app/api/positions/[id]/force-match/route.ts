import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface ForceMatchBody {
  paymentId: string;
  notes: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: positionId } = await params;

  let body: ForceMatchBody;
  try {
    body = await request.json() as ForceMatchBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.paymentId || typeof body.paymentId !== "string") {
    return NextResponse.json(
      { error: "paymentId is required" },
      { status: 400 }
    );
  }

  if (!body.notes || typeof body.notes !== "string" || body.notes.trim().length === 0) {
    return NextResponse.json(
      { error: "notes is required for audit trail" },
      { status: 400 }
    );
  }

  const position = await prisma.reconciliationPosition.findUnique({
    where: { id: positionId },
  });
  if (!position) {
    return NextResponse.json(
      { error: "Position not found" },
      { status: 404 }
    );
  }

  const payment = await prisma.paymentRecord.findUnique({
    where: { id: body.paymentId },
  });
  if (!payment) {
    return NextResponse.json(
      { error: "Payment not found" },
      { status: 404 }
    );
  }

  const now = new Date();

  const [match] = await prisma.$transaction([
    prisma.reconciliationMatch.create({
      data: {
        organizationId: position.organizationId,
        positionId: position.id,
        paymentId: payment.id,
        matchType: "MANUAL",
        matchScore: 1.0,
        matchedBy: "manual", // TODO: extract userId from auth
        matchedAt: now,
        notes: body.notes,
      },
    }),
    prisma.reconciliationPosition.update({
      where: { id: position.id },
      data: {
        status: "MATCHED",
        matchedPaymentId: payment.id,
        matchedAt: now,
      },
    }),
    prisma.paymentRecord.update({
      where: { id: payment.id },
      data: {
        status: "RECONCILED",
        positionId: position.id,
      },
    }),
  ]);

  return NextResponse.json(match, { status: 201 });
}
