---
title: Authentication Security
description: Secure your API credentials and implement proper authentication with BitXPay.
---

# Authentication Security

Proper authentication is critical for securing your BitXPay integration. This guide covers how to securely manage your API credentials.

## API Key Management

### Storing Credentials

::: danger Never hardcode credentials
Never store API keys directly in your source code.
:::

**Recommended approaches:**

1. **Environment Variables**
```bash
# .env (never commit this file)
BITXPAY_API_KEY=your_api_key
BITXPAY_SECRET_KEY=your_secret_key
```

2. **Secrets Manager**
```javascript
// AWS Secrets Manager example
import { SecretsManager } from '@aws-sdk/client-secrets-manager';

const client = new SecretsManager({ region: 'us-east-1' });
const secret = await client.getSecretValue({ SecretId: 'bitxpay-credentials' });
const credentials = JSON.parse(secret.SecretString);
```

3. **Vault**
```javascript
// HashiCorp Vault example
const vault = require('node-vault')();
const { data } = await vault.read('secret/data/bitxpay');
```

### Key Rotation

Rotate your API keys regularly:

1. Generate a new API key in the dashboard
2. Update your application with the new key
3. Verify the new key works correctly
4. Revoke the old key

```javascript
// Support multiple keys during rotation
const apiKeys = [
  process.env.BITXPAY_API_KEY_NEW,
  process.env.BITXPAY_API_KEY_OLD
];
```

## Request Signing

### Signature Generation

Always generate signatures server-side:

```javascript
import crypto from 'crypto';

function signRequest(secretKey, timestamp, method, path, body) {
  const payload = `${timestamp}${method}${path}${body}`;

  return crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');
}
```

### Timestamp Validation

Include a current timestamp and handle clock skew:

```javascript
const timestamp = Math.floor(Date.now() / 1000);

// Requests older than 5 minutes are rejected
// Ensure your server's clock is synchronized (use NTP)
```

## Webhook Verification

Always verify webhook signatures:

```javascript
function verifyWebhook(payload, signature, secretKey) {
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(JSON.stringify(payload))
    .digest('hex');

  // Use timing-safe comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/webhooks', (req, res) => {
  const signature = req.headers['x-bitxpay-signature'];

  if (!verifyWebhook(req.body, signature, secretKey)) {
    return res.status(401).send('Invalid signature');
  }

  // Process webhook...
});
```

## IP Whitelisting

For additional security, whitelist your server IPs:

1. Go to **Dashboard** → **Settings** → **Security**
2. Enable IP Whitelisting
3. Add your server IP addresses

```
Production IPs:
- 203.0.113.10
- 203.0.113.11

Staging IPs:
- 198.51.100.5
```

## Common Vulnerabilities

### Prevent Key Exposure

| Risk | Mitigation |
|------|------------|
| Keys in source code | Use environment variables |
| Keys in logs | Redact sensitive data |
| Keys in URLs | Use headers instead |
| Keys in browser | Keep keys server-side only |

### Secure Transmission

- Always use HTTPS
- Verify SSL certificates
- Use TLS 1.2 or higher

```javascript
// Ensure SSL verification is enabled
const https = require('https');

https.request({
  hostname: 'api.bitxpay.com',
  rejectUnauthorized: true // Default, but be explicit
});
```
