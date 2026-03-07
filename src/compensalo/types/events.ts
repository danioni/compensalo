export interface BankMovementCreatedPayload {
  eventType: "bank.movement.created";
  eventId: string;
  source: "habilitalo";
  timestamp: string;
  data: {
    movementId: string;
    accountId: string;
    institutionId: string;
    amount: number;
    currency: "CLP";
    date: string;
    description: string;
    counterparty: string | null;
    type: "credit" | "debit";
    category: string | null;
    categoryId: string | null;
    categorySource: "fintoc" | "rule" | "ai" | "manual" | null;
    rawFintocId: string;
    journalEntryId: string;
  };
}

export function isBankMovementCreated(
  payload: unknown
): payload is BankMovementCreatedPayload {
  if (typeof payload !== "object" || payload === null) return false;
  const p = payload as Record<string, unknown>;
  return (
    p.eventType === "bank.movement.created" &&
    typeof p.eventId === "string" &&
    p.source === "habilitalo" &&
    typeof p.data === "object" &&
    p.data !== null
  );
}
