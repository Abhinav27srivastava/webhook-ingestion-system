require("dotenv").config();

const crypto = require("crypto");

const url = "https://webhook-ingestion-system.onrender.com/webhook";

const timestamp = Math.floor(Date.now() / 1000).toString();

const body = JSON.stringify({
    id: "evt-production-test-005",
    type: "resource.created",
    timestamp: Number(timestamp),
    data: {
        resourceId: "res-production-001"
    }
});

const signedPayload = `${timestamp}.${body}`;

const signature = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(signedPayload)
    .digest("hex");

console.log("Sending webhook...");
console.log("Timestamp:", timestamp);
console.log("Signature:", `sha256=${signature}`);

fetch(url, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "X-Webhook-Timestamp": timestamp,
        "X-Webhook-Signature": `sha256=${signature}`
    },
    body
})
.then(async response => {
    const text = await response.text();

    console.log("\nSTATUS:", response.status);
    console.log("RESPONSE:", text);
})
.catch(error => {
    console.error("\nERROR:", error);
});