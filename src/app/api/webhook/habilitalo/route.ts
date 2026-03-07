import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyHmacSignature } from "@/lib/hmac";
import { isBankMovementCreated } from "@/compensalo/types/events";
import { processEvent } from "@/compensalo/engine/MatchingEngine";

export async function POST(request: NextRequest) {
  const secret = process.env.HABILITALO_WEBHOOK_SECRET;
  if (!secret) {
    console.error("HABILITALO_WEBHOOK_SECRET not configured");
    return NextResponse.json(
      { error: "Server misconfigured" },
      { status: 500 }
    );
  }

  const rawBody = await request.text();

  // Verify HMAC-SHA256 signature
  const signature = request.headers.get("X-Habilitalo-Signature");
  if (!signature || !verifyHmacSignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!isBankMovementCreated(payload)) {
    return NextResponse.json(
      { error: "Unsupported event type" },
      { status: 422 }
    );
  }

  // Idempotency check
  const existing = await prisma.compensaloEvent.findUnique({
    where: { eventId: payload.eventId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Event already processed", eventId: payload.eventId },
      { status: 409 }
    );
  }

  // Extract organizationId from accountId (format: org_xxx or direct)
  // In v1 we use accountId as organizationId proxy
  const organizationId = payload.data.accountId;

  // Persist event with RECEIVED status
  const event = await prisma.compensaloEvent.create({
    data: {
      eventId: payload.eventId,
      eventType: payload.eventType,
      source: payload.source,
      rawPayload: payload as object,
      organizationId,
      status: "RECEIVED",
    },
  });

  // Acknowledge immediately, process async
  // In v1 we use setTimeout; in production use a proper queue
  setTimeout(() => {
    processEvent(event.id).catch((err) => {
      console.error(`Error processing event ${event.id}:`, err);
    });
  }, 0);

  return NextResponse.json({ received: true, eventId: event.eventId });
}
