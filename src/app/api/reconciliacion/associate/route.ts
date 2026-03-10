import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AssociateBody {
  transactionId: string;
  cobroId: string;
}

/**
 * POST /api/reconciliacion/associate
 * Associates an UNMATCHED position with a pending PaymentRecord (cobro).
 * Creates a ReconciliationMatch, updates both records, and upserts AccountIdentity.
 */
export async function POST(request: NextRequest) {
  let body: AssociateBody;
  try {
    body = (await request.json()) as AssociateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.transactionId || !body.cobroId) {
    return NextResponse.json(
      { error: "transactionId and cobroId are required" },
      { status: 400 }
    );
  }

  const position = await prisma.reconciliationPosition.findUnique({
    where: { id: body.transactionId },
  });
  if (!position) {
    return NextResponse.json(
      { error: "Position not found" },
      { status: 404 }
    );
  }
  if (position.status !== "UNMATCHED") {
    return NextResponse.json(
      { error: "Position is not in UNMATCHED status" },
      { status: 409 }
    );
  }

  const payment = await prisma.paymentRecord.findUnique({
    where: { id: body.cobroId },
  });
  if (!payment) {
    return NextResponse.json(
      { error: "Payment record (cobro) not found" },
      { status: 404 }
    );
  }

  const now = new Date();
  const userId = "manual"; // TODO: from auth

  // 1. Create match + update position + update payment in a transaction
  const [match] = await prisma.$transaction([
    prisma.reconciliationMatch.create({
      data: {
        organizationId: position.organizationId,
        positionId: position.id,
        paymentId: payment.id,
        matchType: "MANUAL",
        matchScore: 1.0,
        matchedBy: userId,
        matchedAt: now,
        notes: "Asociación manual desde cola UNMATCHED",
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

  // 2. Upsert AccountIdentity for learning
  const holderName = position.counterparty;
  if (holderName) {
    const clientName =
      payment.description ?? payment.clientId ?? holderName;

    const existing = await prisma.accountIdentity.findUnique({
      where: {
        organizationId_holderName: {
          organizationId: position.organizationId,
          holderName,
        },
      },
    });

    if (existing) {
      await prisma.accountIdentity.update({
        where: { id: existing.id },
        data: {
          matchCount: { increment: 1 },
          lastMatchedAt: now,
          clientName,
          clientId: payment.clientId ?? existing.clientId,
        },
      });
    } else {
      await prisma.accountIdentity.create({
        data: {
          organizationId: position.organizationId,
          holderName,
          clientName,
          clientId: payment.clientId,
          createdBy: userId,
        },
      });
    }
  }

  return NextResponse.json(
    { success: true, matchId: match.id },
    { status: 200 }
  );
}
