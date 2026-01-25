---
title: Quick Start
description: Create your first cryptocurrency payment with BitXPay in under 5 minutes.
---

# Quick Start

This guide will walk you through creating your first payment with BitXPay.

## Step 1: Get Your API Keys

1. Log in to your [BitXPay Dashboard](https://dashboard.bitxpay.com)
2. Navigate to **Settings** → **API Keys**
3. Copy your **API Key** and **Secret Key**

::: warning
Never share your Secret Key or commit it to version control. Use environment variables to store sensitive credentials.
:::

## Step 2: Install the SDK

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

## Step 3: Initialize the Client

```javascript
import { BitXPay } from '@bitxpay/sdk';

const bitxpay = new BitXPay({
  apiKey: process.env.BITXPAY_API_KEY,
  secretKey: process.env.BITXPAY_SECRET_KEY,
  environment: 'sandbox' // Use 'production' for live payments
});
```

## Step 4: Create a Payment

```javascript
const payment = await bitxpay.payments.create({
  amount: 100.00,
  currency: 'USD',
  crypto: 'BTC',
  description: 'Order #12345',
  webhookUrl: 'https://your-site.com/webhooks/bitxpay',
  redirectUrl: 'https://your-site.com/payment/success'
});

console.log('Payment URL:', payment.paymentUrl);
console.log('Payment ID:', payment.id);
```

## Step 5: Handle the Response

The payment response includes:

| Field | Description |
|-------|-------------|
| `id` | Unique payment identifier |
| `paymentUrl` | URL to redirect the customer |
| `status` | Current payment status |
| `cryptoAmount` | Amount in cryptocurrency |
| `cryptoAddress` | Wallet address for payment |
| `expiresAt` | Payment expiration time |

## Step 6: Redirect Customer

Redirect your customer to the `paymentUrl` to complete the payment:

```javascript
// In your frontend
window.location.href = payment.paymentUrl;
```

## What's Next?

- [Set up Webhooks](/integration/webhooks) to receive payment notifications
- [Explore the Payments API](/api-reference/payments) for more options
- [Review Security Best Practices](/security/best-practices)
