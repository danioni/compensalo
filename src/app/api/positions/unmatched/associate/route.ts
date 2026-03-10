import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface AssociateBody {
  positionId: string;
  clientName: string;
  clientId?: string;
  clientEmail?: string;
}

/**
 * Associates an UNMATCHED position with a client directly (without a PaymentRecord).
 * Creates/updates AccountIdentity for future learning and marks position as MATCHED.
 */
export async function POST(request: NextRequest) {
  let body: AssociateBody;
  try {
    body = await request.json() as AssociateBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.positionId || !body.clientName?.trim()) {
    return NextResponse.json(
      { error: "positionId and clientName are required" },
      { status: 400 }
    );
  }

  const position = await prisma.reconciliationPosition.findUnique({
    where: { id: body.positionId },
  });
  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const now = new Date();
  const userId = "manual"; // TODO: from auth

  // 1. Mark position as MATCHED
  await prisma.reconciliationPosition.update({
    where: { id: position.id },
    data: {
      status: "MATCHED",
      matchedAt: now,
      notes: `Asociado manualmente a ${body.clientName}`,
    },
  });

  // 2. Learn the AccountIdentity
  const holderName = position.counterparty;
  if (holderName) {
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
          clientName: body.clientName,
          clientId: body.clientId ?? existing.clientId,
          clientEmail: body.clientEmail ?? existing.clientEmail,
        },
      });
    } else {
      await prisma.accountIdentity.create({
        data: {
          organizationId: position.organizationId,
          holderName,
          clientName: body.clientName,
          clientId: body.clientId,
          clientEmail: body.clientEmail,
          createdBy: userId,
        },
      });
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
