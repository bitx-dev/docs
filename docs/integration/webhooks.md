---
title: Webhooks
description: Receive real-time payment notifications with BITXpay webhooks.
---

# Webhooks

Webhooks allow you to receive real-time notifications when payment events occur. Instead of polling the API, BITXpay will send HTTP POST requests to your specified endpoint.

## Setting Up Webhooks

### 1. Configure Your Endpoint

In your [BITXpay Dashboard](https://dashboard.bitxpay.com), navigate to **Settings** → **Webhooks** and add your endpoint URL.

### 2. Create a Webhook Handler

```javascript
import express from 'express';
import crypto from 'crypto';

const app = express();

// IMPORTANT: Use express.raw() for webhook routes to get the raw body for signature verification
app.post('/webhooks/bitxpay', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-bitxpay-signature'];
  const payload = req.body; // Raw buffer

  // Verify the webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(payload);

  switch (event.type) {
    case 'payment.completed':
      handlePaymentCompleted(event.data);
      break;
    case 'payment.failed':
      handlePaymentFailed(event.data);
      break;
    case 'payment.expired':
      handlePaymentExpired(event.data);
      break;
  }

  res.status(200).send('OK');
});
```

## Webhook Events

| Event | Description |
|-------|-------------|
| `payment.created` | Payment was created |
| `payment.pending` | Payment is awaiting confirmation |
| `payment.completed` | Payment was successfully completed |
| `payment.failed` | Payment failed |
| `payment.expired` | Payment expired before completion |
| `payment.refunded` | Payment was refunded |

## Webhook Payload

```json
{
  "id": "evt_1234567890",
  "type": "payment.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "paymentId": "pay_abc123",
    "amount": 100.00,
    "currency": "USD",
    "cryptoAmount": 0.0025,
    "crypto": "BTC",
    "status": "completed",
    "txHash": "abc123def456..."
  }
}
```

## Verifying Signatures

::: warning Important
Always verify webhook signatures to ensure requests are from BITXpay.
:::

```javascript
import crypto from 'crypto';

// payload must be the raw request body (Buffer or string), NOT a parsed JSON object
function verifyWebhook(rawPayload, signature, secretKey) {
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(rawPayload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Retry Policy

BITXpay will retry failed webhook deliveries:

- **Attempt 1**: Immediate
- **Attempt 2**: After 5 minutes
- **Attempt 3**: After 30 minutes
- **Attempt 4**: After 2 hours
- **Attempt 5**: After 24 hours

Your endpoint should return a `2xx` status code to acknowledge receipt.

## Testing Webhooks

Use our webhook testing tool in the dashboard to send test events to your endpoint.

```bash
# Or use the CLI
bitxpay webhooks test --event payment.completed --url https://your-site.com/webhooks
```
