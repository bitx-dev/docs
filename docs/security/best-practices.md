---
title: Security Best Practices
description: Security recommendations for your BitXPay integration.
---

# Security Best Practices

Follow these best practices to ensure a secure integration with BitXPay.

## API Security

### 1. Use Environment Variables

Never hardcode credentials in your application:

```javascript
// ❌ Bad
const apiKey = 'sk_live_abc123...';

// ✅ Good
const apiKey = process.env.BITXPAY_API_KEY;
```

### 2. Validate All Input

Sanitize and validate all user input before sending to the API:

```javascript
function createPayment(amount, currency) {
  // Validate amount
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('Invalid amount');
  }

  // Validate currency
  const validCurrencies = ['USD', 'EUR', 'GBP'];
  if (!validCurrencies.includes(currency)) {
    throw new Error('Invalid currency');
  }

  return bitxpay.payments.create({ amount, currency, crypto: 'BTC' });
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

```javascript
app.post('/webhooks/bitxpay', (req, res) => {
  const signature = req.headers['x-bitxpay-signature'];

  if (!bitxpay.webhooks.verify(req.body, signature)) {
    console.warn('Invalid webhook signature received');
    return res.status(401).send('Invalid signature');
  }

  // Process verified webhook...
});
```

### 2. Use HTTPS Endpoints

Always use HTTPS for webhook URLs:

```
❌ http://your-site.com/webhooks
✅ https://your-site.com/webhooks
```

### 3. Implement Idempotency

Handle duplicate webhooks gracefully:

```javascript
const processedEvents = new Set();

app.post('/webhooks/bitxpay', async (req, res) => {
  const eventId = req.body.id;

  // Check if already processed
  if (processedEvents.has(eventId)) {
    return res.status(200).send('Already processed');
  }

  // Process event...

  processedEvents.add(eventId);
  res.status(200).send('OK');
});
```

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
- [ ] Tested in sandbox environment
