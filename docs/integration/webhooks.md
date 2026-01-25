---
title: Webhooks
description: Receive real-time payment notifications with BitXPay webhooks.
---

# Webhooks

Webhooks allow you to receive real-time notifications when payment events occur. Instead of polling the API, BitXPay will send HTTP POST requests to your specified endpoint.

## Setting Up Webhooks

### 1. Configure Your Endpoint

In your [BitXPay Dashboard](https://dashboard.bitxpay.com), navigate to **Settings** → **Webhooks** and add your endpoint URL.

### 2. Create a Webhook Handler

```javascript
import express from 'express';
import { BitXPay } from '@bitxpay/sdk';

const app = express();
app.use(express.json());

const bitxpay = new BitXPay({
  apiKey: process.env.BITXPAY_API_KEY,
  secretKey: process.env.BITXPAY_SECRET_KEY
});

app.post('/webhooks/bitxpay', (req, res) => {
  const signature = req.headers['x-bitxpay-signature'];

  // Verify the webhook signature
  if (!bitxpay.webhooks.verify(req.body, signature)) {
    return res.status(401).send('Invalid signature');
  }

  const event = req.body;

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
Always verify webhook signatures to ensure requests are from BitXPay.
:::

```javascript
import crypto from 'crypto';

function verifyWebhook(payload, signature, secretKey) {
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Retry Policy

BitXPay will retry failed webhook deliveries:

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
