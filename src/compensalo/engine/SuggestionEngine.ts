import { prisma } from "@/lib/prisma";
import type { AccountIdentity, ReconciliationPosition } from "@prisma/client";

/**
 * Suggests a client match for an UNMATCHED position based on
 * previously learned AccountIdentity mappings.
 */
export async function suggestMatch(
  position: ReconciliationPosition
): Promise<AccountIdentity | null> {
  const holderName = position.counterparty;
  if (!holderName) return null;

  // 1. Exact match first
  const exact = await prisma.accountIdentity.findUnique({
    where: {
      organizationId_holderName: {
        organizationId: position.organizationId,
        holderName,
      },
    },
  });
  if (exact) return exact;

  // 2. Case-insensitive fallback
  const caseInsensitive = await prisma.accountIdentity.findFirst({
    where: {
      organizationId: position.organizationId,
      holderName: { equals: holderName, mode: "insensitive" },
    },
  });

  return caseInsensitive;
}
