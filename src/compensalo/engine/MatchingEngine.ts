import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { BankMovementCreatedPayload } from "@/compensalo/types/events";
import { suggestMatch } from "./SuggestionEngine";

const MATCH_WINDOW_DAYS = 3;

export async function processEvent(compensaloEventId: string): Promise<void> {
  const event = await prisma.compensaloEvent.findUniqueOrThrow({
    where: { id: compensaloEventId },
  });

  // Mark as processing
  await prisma.compensaloEvent.update({
    where: { id: event.id },
    data: { status: "PROCESSING" },
  });

  try {
    const payload = event.rawPayload as unknown as BankMovementCreatedPayload;
    const { movementId, amount, date, type, journalEntryId, description, counterparty, categoryId, categorySource } =
      payload.data;

    const movementDate = new Date(date);
    const movementType = type.toUpperCase() as "CREDIT" | "DEBIT";

    // Create the ReconciliationPosition
    const position = await prisma.reconciliationPosition.upsert({
      where: { movementId },
      create: {
        organizationId: event.organizationId,
        movementId,
        journalEntryId,
        amount: new Prisma.Decimal(amount),
        currency: "CLP",
        date: movementDate,
        description,
        counterparty,
        type: movementType,
        categoryId,
        categorySource,
        status: "UNMATCHED",
      },
      update: {},
    });

    // Search for matching PaymentRecords
    const dateFrom = new Date(movementDate);
    dateFrom.setDate(dateFrom.getDate() - MATCH_WINDOW_DAYS);
    const dateTo = new Date(movementDate);
    dateTo.setDate(dateTo.getDate() + MATCH_WINDOW_DAYS);

    const candidates = await prisma.paymentRecord.findMany({
      where: {
        organizationId: event.organizationId,
        status: { in: ["PENDING", "CONFIRMED"] },
        amount: new Prisma.Decimal(amount),
        paidAt: { gte: dateFrom, lte: dateTo },
      },
      orderBy: { paidAt: "asc" },
    });

    if (candidates.length === 0) {
      // No match found — try suggestion engine
      const suggestion = await suggestMatch(position);
      if (suggestion) {
        await prisma.reconciliationPosition.update({
          where: { id: position.id },
          data: {
            suggestedClientName: suggestion.clientName,
            suggestedClientId: suggestion.clientId,
            suggestionSource: "account_identity",
          },
        });
      }

      await prisma.compensaloEvent.update({
        where: { id: event.id },
        data: { status: "UNMATCHED" },
      });
      return;
    }

    // Determine match type and best candidate
    let matchType: "EXACT" | "FUZZY";
    let matchScore: number;
    let bestCandidate: (typeof candidates)[number];

    if (candidates.length === 1) {
      bestCandidate = candidates[0];
      matchType = "EXACT";
      matchScore = 1.0;
    } else {
      // Multiple candidates — pick closest by date
      bestCandidate = candidates.reduce<(typeof candidates)[number]>((closest, current) => {
        const closestDiff = Math.abs(closest.paidAt.getTime() - movementDate.getTime());
        const currentDiff = Math.abs(current.paidAt.getTime() - movementDate.getTime());
        return currentDiff < closestDiff ? current : closest;
      }, candidates[0]);
      matchType = "FUZZY";
      matchScore = 0.7;
    }

    // Execute match in a transaction
    await prisma.$transaction([
      // Create the match record
      prisma.reconciliationMatch.create({
        data: {
          organizationId: event.organizationId,
          positionId: position.id,
          paymentId: bestCandidate.id,
          matchType,
          matchScore,
        },
      }),
      // Update position → MATCHED
      prisma.reconciliationPosition.update({
        where: { id: position.id },
        data: {
          status: "MATCHED",
          matchedPaymentId: bestCandidate.id,
          matchedAt: new Date(),
        },
      }),
      // Update payment → RECONCILED
      prisma.paymentRecord.update({
        where: { id: bestCandidate.id },
        data: {
          status: "RECONCILED",
          positionId: position.id,
        },
      }),
      // Update event → MATCHED
      prisma.compensaloEvent.update({
        where: { id: event.id },
        data: { status: "MATCHED" },
      }),
    ]);
  } catch (error) {
    console.error(`Matching engine error for event ${compensaloEventId}:`, error);
    await prisma.compensaloEvent.update({
      where: { id: event.id },
      data: { status: "ERROR" },
    });
    throw error;
  }
}
