---
title: Environments
description: Understand BITXpay sandbox and production environments.
---

# Environments

BITXpay provides two environments: a **sandbox** for development and testing, and a **production** environment for live transactions.

## Sandbox Environment

Use the sandbox account for development. For engine-backed checkout, explicitly create a link with `is_test: true` to request a simulated order. Discover available currencies and networks through the checkout catalog; choosing the sandbox host alone does not set test mode.

### Sandbox Configuration

```javascript
import { BitxpayClient } from '@bitxpay/sdk';

const bitxpay = new BitxpayClient({
  apiKey: process.env.MERCHANT_API_KEY,
  privateKey: process.env.MERCHANT_PRIVATE_KEY,
  environment: 'sandbox'
});
```

### Sandbox API Base URL
```
https://sandboxapi.bitxpay.com/api/v1
```

### Sandbox Dashboard

[sandbox.bitxpay.com](https://sandbox.bitxpay.com) — Sign up and generate your sandbox API keys here.

### Sandbox API Keys

- **Format**: `btxm_*` (Merchant API)
- **Access**: Sandbox account access; explicitly request simulated checkout with `is_test: true`
- **Authentication**: Ed25519 signature (EdDSA, raw bytes, Base64)

## Production Environment

The production environment handles real transactions with actual cryptocurrency.

### Production Configuration

```javascript
import { BitxpayClient } from '@bitxpay/sdk';

const bitxpay = new BitxpayClient({
  apiKey: process.env.MERCHANT_API_KEY,
  privateKey: process.env.MERCHANT_PRIVATE_KEY,
  environment: 'production'
});
```

### Production API Base URL
```
{{ $api.production.baseUrl }}
```

### Production API Keys

- **Format**: `btxm_*` (Merchant API)
- **Access**: Full production access — real funds
- **Security**: Store securely, never commit to version control
- **Authentication**: Ed25519 signature (EdDSA, raw bytes, Base64)

## Testing & Development

Use the sandbox environment for all development and testing. Additional local testing tools:

### Webhook Testing

- **webhook.site** - Free temporary webhook URLs
- **ngrok** - Expose local development server
- **Postman** - Manual webhook simulation

```bash
# Example: Using ngrok for local webhook testing
ngrok http 3000
```

## Production Best Practices

Before going live with production traffic:

### Security Checklist

- [x] **API Keys**: Store in environment variables or secure vault
- [x] **HTTPS Only**: All webhook endpoints must use HTTPS
- [x] **Signature Verification**: Always verify webhook signatures
- [x] **Error Handling**: Implement robust error handling
- [x] **Logging**: Log all transactions and errors
- [x] **Rate Limiting**: Handle API rate limits gracefully
- [x] **Monitoring**: Set up alerts for failed transactions

### Transaction Safety

```javascript
// Always implement proper error handling
try {
  const payment = await bitxpay.payments.create({
    payment_name: 'Order #12345',
    amount: 100.00,
    currency: 'USDT',
    description: 'Order #12345'
  });
  
  // Store payment ID for tracking
  await database.savePayment({
    paymentId: payment.id,
    status: payment.payment_status,
    amount: payment.amount
  });
  
} catch (error) {
  console.error('Payment creation failed:', error);
  // Implement proper error handling
  await notifyAdmin(error);
}
```

### Webhook Security

Verify `X-Webhook-Signature: sha256=<hex>` over the raw request body with the webhook secret for that environment. Use the shared [webhook handler examples](/integration/webhooks#verify-deliveries).

## Need Help?

We're here to help ensure your integration is secure and reliable:

- **Documentation**: {{ $site.urls.support.documentation }}
<!-- - **Discord Community**: [discord.gg/bitxpay](https://discord.gg/bitxpay) -->
- **Email Support**: support@bitxpay.com
<!-- - **GitHub Issues**: [github.com/bitxpay/issues](https://github.com/bitxpay/issues) -->

::: warning Important
All production transactions on BITXpay involve real funds on mainnet. Always fully test your integration in the sandbox environment before switching to production credentials.
:::
