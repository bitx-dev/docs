---
title: Environments
description: Understand BITXpay sandbox and production environments.
---

# Environments

BITXpay provides two environments: a **sandbox** for development and testing, and a **production** environment for live transactions.

## Sandbox Environment

The sandbox environment allows you to test your integration without using real funds. All 16 supported blockchain networks are available in sandbox mode.

### Sandbox Configuration

```javascript
const bitxpay = new BITXpay({
  apiKey: process.env.MERCHANT_API_KEY,
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
- **Access**: Full sandbox access — no real funds involved
- **Authentication**: Ed25519 signature (EdDSA, raw bytes, Base64)

## Production Environment

The production environment handles real transactions with actual cryptocurrency.

### Production Configuration

```javascript
const bitxpay = new BITXpay({
  apiKey: process.env.MERCHANT_API_KEY,
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
    amount: '100.00',
    currency: 'USDT',
    description: 'Order #12345'
  });
  
  // Store payment ID for tracking
  await database.savePayment({
    paymentId: payment.id,
    status: payment.status,
    amount: payment.amount
  });
  
} catch (error) {
  console.error('Payment creation failed:', error);
  // Implement proper error handling
  await notifyAdmin(error);
}
```

### Webhook Security

```javascript
// Always verify webhook signatures
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Validate length before comparison to prevent errors
  if (signature.length !== expectedSignature.length) {
    return false;
  }
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

## Need Help?

We're here to help ensure your integration is secure and reliable:

- **Documentation**: {{ $site.urls.support.documentation }}
<!-- - **Discord Community**: [discord.gg/bitxpay](https://discord.gg/bitxpay) -->
- **Email Support**: support@bitxpay.com
<!-- - **GitHub Issues**: [github.com/bitxpay/issues](https://github.com/bitxpay/issues) -->

::: warning Important
All production transactions on BITXpay involve real funds on mainnet. Always fully test your integration in the sandbox environment before switching to production credentials.
:::
