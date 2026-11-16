---
title: Security Best Practices
description: Security recommendations for your BITXpay integration.
---

# Security Best Practices

Follow these best practices to ensure a secure integration with BITXpay.

## API Security

### 1. Use Environment Variables

Never hardcode credentials in your application:

```javascript
// ❌ Bad
const apiKey = 'btxm_example_do_not_hardcode';

// ✅ Good
const apiKey = process.env.BITXPAY_API_KEY;
```

### 2. Validate All Input

Sanitize and validate all user input before sending to the API:

```javascript
function createPayment(paymentName, amount, currency, supportedCurrencyCodes) {
  // Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount');
  }

  // Validate currency
  // Populate supportedCurrencyCodes from the currency/catalog endpoint.
  if (!supportedCurrencyCodes.includes(currency)) {
    throw new Error('Invalid currency');
  }

  return bitxpay.payments.create({ payment_name: paymentName, amount, currency });
}
```

### 3. Handle Errors Securely

Don't expose sensitive information in error messages:

```javascript
// ❌ Bad - exposes internal details
catch (error) {
  res.status(500).json({ error: error.stack });
}

// ✅ Good - generic error message
catch (error) {
  console.error('Payment error:', error); // Log internally
  res.status(500).json({ error: 'Payment processing failed' });
}
```

## Webhook Security

### 1. Always Verify Signatures

Verify `X-Webhook-Signature: sha256=<hex>` over the raw request body before JSON parsing:

<<< @/snippets/webhook.mjs{javascript}

### 2. Use HTTPS Endpoints

Always use HTTPS for webhook URLs:

```
❌ http://your-site.com/webhooks
✅ https://your-site.com/webhooks
```

### 3. Implement Idempotency

Store or durably enqueue verified deliveries before acknowledging them. Apply business updates idempotently using resource and transaction references from `data`, plus the event transition. Delivery `id` changes on retry; `event_id` identifies the event definition. Neither is a stable business deduplication key by itself. See [Webhooks](/get-started/webhooks#retries-and-duplicate-handling).

## Data Protection

### 1. Minimize Data Storage

Only store necessary payment data:

```javascript
// ❌ Bad - storing sensitive data
await db.payments.insert({
  ...paymentResponse,
  apiKey: secretKey // Never store this!
});

// ✅ Good - store only what you need
await db.payments.insert({
  paymentId: paymentResponse.id,
  amount: paymentResponse.amount,
  status: paymentResponse.status,
  createdAt: new Date()
});
```

### 2. Encrypt Sensitive Data

Encrypt sensitive data at rest:

```javascript
import crypto from 'crypto';

function encrypt(text, key) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    encrypted: encrypted.toString('hex'),
    tag: tag.toString('hex')
  };
}
```

### 3. Use Secure Logging

Redact sensitive information from logs:

```javascript
function redactSensitiveData(obj) {
  const redacted = { ...obj };
  const sensitiveFields = ['apiKey', 'secretKey', 'password', 'token'];

  sensitiveFields.forEach(field => {
    if (redacted[field]) {
      redacted[field] = '[REDACTED]';
    }
  });

  return redacted;
}

console.log('Request:', redactSensitiveData(requestData));
```

## Infrastructure Security

### 1. Keep Dependencies Updated

Regularly update your dependencies:

```bash
# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

### 2. Rate Limit Your Endpoints

Protect your webhook endpoints from abuse:

```javascript
import rateLimit from 'express-rate-limit';

const webhookLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per window
});

app.use('/webhooks', webhookLimiter);
```

### 3. Monitor for Anomalies

Set up alerts for unusual activity:

- Unexpected payment volumes
- Failed authentication attempts
- Webhook delivery failures
- Unusual geographic patterns

## Checklist

Use this checklist before going live:

- [ ] API keys stored in environment variables
- [ ] Webhook signature verification implemented
- [ ] HTTPS used for all endpoints
- [ ] Input validation in place
- [ ] Error handling doesn't expose sensitive data
- [ ] Logging redacts sensitive information
- [ ] Dependencies are up to date
- [ ] Rate limiting configured
- [ ] Monitoring and alerts set up
- [ ] Integration fully tested in sandbox environment before production switch
