import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface FlagExceptionBody {
  reason: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: positionId } = await params;

  let body: FlagExceptionBody;
  try {
    body = await request.json() as FlagExceptionBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.reason || typeof body.reason !== "string" || body.reason.trim().length === 0) {
    return NextResponse.json(
      { error: "reason is required" },
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

  const updated = await prisma.reconciliationPosition.update({
    where: { id: positionId },
    data: {
      status: "EXCEPTION",
      notes: `EXCEPTION: ${body.reason}`,
    },
  });

  return NextResponse.json(updated);
}
