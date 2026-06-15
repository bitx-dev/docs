# JavaScript / TypeScript SDK

The `@bitxpay/sdk` package is the official server-side SDK for Node.js and TypeScript. It handles request authentication, response parsing, and provides a typed interface for the full BITXpay API.

**npm:** [npmjs.com/package/@bitxpay/sdk](https://www.npmjs.com/package/@bitxpay/sdk)

## Installation

::: code-group

```bash [npm]
npm install @bitxpay/sdk
```

```bash [yarn]
yarn add @bitxpay/sdk
```

```bash [pnpm]
pnpm add @bitxpay/sdk
```

:::

## Requirements

- **Node.js** 16 or higher
- **TypeScript** 4.7+ (optional, but recommended)

## Quick Start

```typescript
import { BITXpay } from '@bitxpay/sdk';

const client = new BITXpay({
  apiKey: process.env.BITXPAY_API_KEY!,
  apiSecret: process.env.BITXPAY_API_SECRET!,
  environment: 'sandbox' // 'sandbox' | 'production'
});
```

::: warning Keep credentials out of source code
Always load `apiKey` and `apiSecret` from environment variables. Never hard-code them.
:::

---

## Configuration

### `new BITXpay(options)`

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `apiKey` | `string` | ✅ | — | Your BITXpay API key |
| `apiSecret` | `string` | ✅ | — | Your BITXpay API secret |
| `environment` | `'sandbox' \| 'production'` | ❌ | `'sandbox'` | Target environment |
| `timeout` | `number` | ❌ | `30000` | Request timeout in ms |

---

## Payments

### Create a payment

```typescript
const payment = await client.payments.create({
  amount: '100.00',
  currency: 'USD',
  description: 'Order #1234',
  redirectUrl: 'https://yoursite.com/success',
  webhookUrl: 'https://yoursite.com/webhook'
});

console.log('Checkout URL:', payment.hostedUrl);
console.log('Payment ID:', payment.id);
```

### Get a payment

```typescript
const payment = await client.payments.get('pay_xxxxxxxxxxxxxxxx');

console.log('Status:', payment.status);
console.log('Amount:', payment.amount, payment.currency);
```

### List payments

```typescript
const { data, pagination } = await client.payments.list({
  page: 1,
  limit: 20,
  status: 'completed' // optional filter
});

data.forEach(payment => {
  console.log(payment.id, payment.status);
});
```

### Payment object

```typescript
interface Payment {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  amount: string;
  currency: string;
  description: string;
  hostedUrl: string;
  redirectUrl: string;
  webhookUrl: string;
  createdAt: string;
  updatedAt: string;
}
```

---

## Payment Links

### Create a payment link

```typescript
const link = await client.paymentLinks.create({
  amount: '50.00',
  currency: 'USD',
  title: 'Product Purchase',
  description: 'Premium subscription',
  expiresAt: '2025-12-31T23:59:59Z' // optional
});

console.log('Payment Link URL:', link.url);
```

### Get a payment link

```typescript
const link = await client.paymentLinks.get('pl_xxxxxxxxxxxxxxxx');
```

### List payment links

```typescript
const { data } = await client.paymentLinks.list({ page: 1, limit: 10 });
```

---

## Subscriptions

### Create a subscription plan

```typescript
const plan = await client.subscriptions.createPlan({
  name: 'Pro Plan',
  amount: '29.99',
  currency: 'USD',
  interval: 'monthly', // 'daily' | 'weekly' | 'monthly' | 'yearly'
  description: 'Monthly Pro subscription'
});
```

### Subscribe a customer

```typescript
const subscription = await client.subscriptions.create({
  planId: plan.id,
  customerEmail: 'user@example.com',
  webhookUrl: 'https://yoursite.com/webhook'
});
```

---

## Webhooks

### Verify a webhook signature

Always verify incoming webhook payloads before processing them.

```typescript
import { verifyWebhook } from '@bitxpay/sdk';

app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-bitxpay-signature'] as string;

  const isValid = verifyWebhook({
    payload: req.body,
    signature,
    secret: process.env.BITXPAY_WEBHOOK_SECRET!
  });

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  const event = JSON.parse(req.body.toString());

  switch (event.type) {
    case 'payment.completed':
      console.log('Payment completed:', event.data.id);
      break;
    case 'payment.failed':
      console.log('Payment failed:', event.data.id);
      break;
    case 'subscription.renewed':
      console.log('Subscription renewed:', event.data.subscriptionId);
      break;
  }

  res.status(200).send('OK');
});
```

### Webhook event types

| Event | Description |
|-------|-------------|
| `payment.pending` | Payment created, awaiting funds |
| `payment.processing` | Funds received, confirming on-chain |
| `payment.completed` | Payment fully confirmed |
| `payment.failed` | Payment failed or rejected |
| `payment.expired` | Payment window expired |
| `subscription.created` | New subscription started |
| `subscription.renewed` | Subscription billing renewed |
| `subscription.cancelled` | Subscription cancelled |

---

## Error Handling

The SDK throws typed errors. Always wrap API calls in a `try/catch`:

```typescript
import { BITXpayError, BITXpayAPIError } from '@bitxpay/sdk';

try {
  const payment = await client.payments.create({ ... });
} catch (err) {
  if (err instanceof BITXpayAPIError) {
    console.error('API error:', err.statusCode, err.message);
    console.error('Error code:', err.code);
  } else if (err instanceof BITXpayError) {
    console.error('SDK error:', err.message);
  } else {
    throw err;
  }
}
```

### Common error codes

| Code | Description |
|------|-------------|
| `INVALID_API_KEY` | API key is missing or invalid |
| `INVALID_SIGNATURE` | Request signature does not match |
| `INSUFFICIENT_FUNDS` | Wallet balance too low |
| `PAYMENT_NOT_FOUND` | Payment ID does not exist |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

---

## TypeScript Support

The SDK ships with full TypeScript definitions. No `@types` package needed.

```typescript
import type { Payment, PaymentCreateParams, Subscription } from '@bitxpay/sdk';

async function createOrder(params: PaymentCreateParams): Promise<Payment> {
  return client.payments.create(params);
}
```

---

## Environment Variables

Recommended `.env` setup:

```bash
BITXPAY_API_KEY=your_api_key_here
BITXPAY_API_SECRET=your_api_secret_here
BITXPAY_WEBHOOK_SECRET=your_webhook_secret_here
BITXPAY_ENVIRONMENT=sandbox
```

---

## Next Steps

- [Wallet SDK](/sdks/wallet-sdk) — Client-side wallet connection
- [API Reference](/api-reference/) — Full endpoint documentation
- [Webhooks](/integration/webhooks) — Webhook events and verification
- [Testing](/testing/) — Test your integration in sandbox
