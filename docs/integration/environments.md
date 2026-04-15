---
title: Environments
description: Understand BITXpay production environment and upcoming testnet support.
---

# Environments

BITXpay currently operates exclusively on **mainnet** for production-grade applications. Testnet support is planned for future releases.

## Current Environment: Production (Mainnet Only)

BITXpay currently supports mainnet-only operations across all 16 supported blockchain networks. This means all transactions are real and involve actual cryptocurrency.

### Production Configuration

```javascript
const bitxpay = new BITXpay({
  apiKey: process.env.BITXPAY_API_KEY,
  secretKey: process.env.BITXPAY_SECRET_KEY,
  environment: 'production'
});
```

### Production API Base URL
```
https://api.bitxpay.com/v1
```

### API Keys

All API keys are production keys and should be handled with maximum security:

- **Format**: `sk_live_*` prefix
- **Access**: Full production access
- **Security**: Store securely, never commit to version control

## Development & Testing

Since BITXpay currently operates on mainnet only, we recommend the following approaches for development and testing:

### 1. Use Small Amounts for Testing

When testing your integration, use minimal cryptocurrency amounts to reduce risk:

```javascript
// Example: Test with small amounts
const testPayment = await bitxpay.payments.create({
  amount: '0.01',  // Small test amount
  currency: 'USD',
  description: 'Integration test'
});
```

### 2. Dedicated Test Wallets

Create separate wallets specifically for development and testing purposes:

- Use dedicated addresses for testing
- Keep minimal balances in test wallets
- Monitor all test transactions closely

### 3. Webhook Testing

Test webhook integration using tools like:

- **webhook.site** - Free temporary webhook URLs
- **ngrok** - Expose local development server
- **Postman** - Manual webhook simulation

```bash
# Example: Using ngrok for local webhook testing
ngrok http 3000
```

## Sandbox Environment (Coming Soon)

::: info Testnet Support Coming Soon
We're actively developing a sandbox environment with testnet support. This will allow you to:

- Test integrations without real funds
- Simulate various payment scenarios
- Use testnet cryptocurrencies across all supported networks
- Access sandbox-specific API endpoints

**Expected Features:**
- Dedicated sandbox API: `https://sandbox-api.bitxpay.com/v1`
- Test API keys with `sk_test_*` prefix
- Testnet support for all 16 networks
- Magic amounts for scenario simulation
- Webhook testing without real transactions

Stay tuned for updates on our [GitHub](https://github.com/bitxpay) or [Discord community](https://discord.gg/bitxpay).
:::

## Production Best Practices

Since you're working directly with mainnet:

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
    currency: 'USD',
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

Since we're currently mainnet-only, we're here to help ensure your integration is secure and reliable:

- **Documentation**: [docs.bitxpay.com](https://docs.bitxpay.com)
- **Discord Community**: [discord.gg/bitxpay](https://discord.gg/bitxpay)
- **Email Support**: support@bitxpay.com
- **GitHub Issues**: [github.com/bitxpay/issues](https://github.com/bitxpay/issues)

::: warning Important
All transactions on BITXpay are currently real mainnet transactions. Always test with small amounts and implement proper security measures before going live with production volumes.
:::
