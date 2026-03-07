/**
 * Registers the Compensalo webhook endpoint in Habilitalo.
 *
 * Reads COMPENSALO_WEBHOOK_URL, HABILITALO_WEBHOOK_SECRET, and HABILITALO_BASE_URL
 * from .env.local via dotenv, then POSTs to Habilitalo's webhook registration API.
 *
 * If an endpoint with the same URL already exists, it exits gracefully.
 *
 * Usage: npx tsx scripts/register-compensalo-webhook.ts
 */

import { config } from "dotenv";

config({ path: ".env.local" });

async function main() {
  const baseUrl = process.env.HABILITALO_BASE_URL;
  const webhookUrl = process.env.COMPENSALO_WEBHOOK_URL;
  const webhookSecret = process.env.HABILITALO_WEBHOOK_SECRET;

  if (!baseUrl) throw new Error("HABILITALO_BASE_URL is required in .env.local");
  if (!webhookUrl) throw new Error("COMPENSALO_WEBHOOK_URL is required in .env.local");
  if (!webhookSecret) throw new Error("HABILITALO_WEBHOOK_SECRET is required in .env.local");

  const fullWebhookUrl = `${webhookUrl}/api/webhook/habilitalo`;

  console.log("Registering Compensalo webhook in Habilitalo...");
  console.log(`  Habilitalo base URL: ${baseUrl}`);
  console.log(`  Webhook URL: ${fullWebhookUrl}`);

  const response = await fetch(`${baseUrl}/api/habilitalo/webhooks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: fullWebhookUrl,
      secret: webhookSecret,
      events: ["bank.movement.created"],
      description: "Compensalo reconciliation engine",
    }),
  });

  if (response.status === 409) {
    console.log("\nWebhook endpoint already registered for this URL. Nothing to do.");
    return;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to register webhook (${response.status}): ${errorText}`);
  }

  const result = (await response.json()) as { webhookEndpointId: string };

  console.log("\nWebhook registered successfully!");
  console.log(`  webhookEndpointId: ${result.webhookEndpointId}`);
}

main().catch((error) => {
  console.error("Registration failed:", error);
  process.exit(1);
});
