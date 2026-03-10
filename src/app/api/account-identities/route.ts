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

  const identities = await prisma.accountIdentity.findMany({
    where: { organizationId },
    orderBy: { matchCount: "desc" },
  });

  return NextResponse.json(identities);
}
