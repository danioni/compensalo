/**
 * Auto-registration script for Compensalo webhook in Habilitalo.
 *
 * Registers this service as a consumer of bank.movement.created events.
 *
 * Usage: npx tsx scripts/setup.ts
 */

import "dotenv/config";

async function main() {
  const baseUrl = process.env.HABILITALO_BASE_URL;
  const webhookSecret = process.env.HABILITALO_WEBHOOK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!baseUrl) throw new Error("HABILITALO_BASE_URL is required");
  if (!webhookSecret) throw new Error("HABILITALO_WEBHOOK_SECRET is required");
  if (!appUrl) throw new Error("NEXT_PUBLIC_APP_URL is required");

  const webhookUrl = `${appUrl}/api/webhook/habilitalo`;

  console.log(`Registering webhook in Habilitalo...`);
  console.log(`  Base URL: ${baseUrl}`);
  console.log(`  Webhook URL: ${webhookUrl}`);

  const response = await fetch(`${baseUrl}/api/habilitalo/webhooks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url: webhookUrl,
      events: ["bank.movement.created"],
      secret: webhookSecret,
      description: "Compensalo reconciliation service",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to register webhook (${response.status}): ${errorText}`
    );
  }

  const result = (await response.json()) as { webhookEndpointId: string };

  console.log(`\nWebhook registered successfully!`);
  console.log(`  webhookEndpointId: ${result.webhookEndpointId}`);
  console.log(`\nCompensalo will now receive bank.movement.created events.`);
}

main().catch((error) => {
  console.error("Setup failed:", error);
  process.exit(1);
});
