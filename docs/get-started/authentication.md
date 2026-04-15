# Authentication

Securing your BITXpay API keys is critical. Exposed credentials can lead to compromised accounts and financial loss. BITXpay supports two authentication methods depending on which API you are using.

## On this page
- [Overview](#overview)
- [Security overview](#security-overview)
- [DSA signature — merchant APIs](#dsa-signature-merchant-apis)
- [HMAC-SHA256 — standard APIs](#hmac-sha256-standard-apis)
- [API key permissions](#api-key-permissions)
- [Security best practices](#security-best-practices)

## Overview

BITXpay supports two authentication methods depending on which API you're using. Merchant-facing APIs use DSA signature authentication. Standard payment APIs use HMAC-SHA256.

### DSA Signature
**Merchant APIs**  
Payment links and merchant-facing operations. Uses DSA private key signing — FIPS 186-4 standard.

### HMAC-SHA256
**Standard payment APIs**  
Core payment operations. Uses HMAC-SHA256 with your API key and secret.

## Security overview

::: danger Secret API keys must never appear in client side code or public repositories
These keys are for server side use only. If a secret key is exposed, delete it immediately from the dashboard and generate a new one.
:::

## DSA signature — merchant APIs

### Getting your keys

1. Sign up at [sandbox.bitxpay.com/auth/signup](https://sandbox.bitxpay.com/auth/signup)
2. Navigate to **API Keys**
3. Select **Create API key** under the Secret API Keys tab
4. Enter an API key nickname (restrictions are optional)
5. Click **Create**
6. Secure your API Key ID and Secret in a safe location

### Required headers

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Generating the signature

The JWT token must be signed using your DSA private key following FIPS 186-4 standard.

### Code examples

::: code-group

```javascript [Node.js]
const jwt = require('jsonwebtoken');
const fs = require('fs');

// Load your DSA private key
const privateKey = fs.readFileSync('path/to/private-key.pem');

// Create JWT token
const token = jwt.sign(
  {
    sub: 'your-api-key-id',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  },
  privateKey,
  { algorithm: 'ES256' }
);

// Use in request
const response = await fetch('https://api.bitxpay.com/v1/payment-links', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    amount: '100.00',
    currency: 'USD'
  })
});
```

```python [Python]
import jwt
import time
from pathlib import Path

# Load your DSA private key
private_key = Path('path/to/private-key.pem').read_text()

# Create JWT token
token = jwt.encode(
    {
        'sub': 'your-api-key-id',
        'iat': int(time.time()),
        'exp': int(time.time()) + 3600
    },
    private_key,
    algorithm='ES256'
)

# Use in request
import requests

response = requests.post(
    'https://api.bitxpay.com/v1/payment-links',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    },
    json={
        'amount': '100.00',
        'currency': 'USD'
    }
)
```

:::

## HMAC-SHA256 — standard APIs

### Required headers

```http
X-API-Key: <your-api-key>
X-Signature: <hmac-sha256-signature>
X-Timestamp: <unix-timestamp>
Content-Type: application/json
```

### Code examples

::: code-group

```javascript [Node.js]
const crypto = require('crypto');

function generateSignature(apiSecret, timestamp, method, path, body = '') {
  const message = `${timestamp}${method}${path}${body}`;
  return crypto
    .createHmac('sha256', apiSecret)
    .update(message)
    .digest('hex');
}

// Example usage
const apiKey = 'your-api-key';
const apiSecret = 'your-api-secret';
const timestamp = Date.now().toString();
const method = 'POST';
const path = '/v1/payments';
const body = JSON.stringify({ amount: '100.00', currency: 'USD' });

const signature = generateSignature(apiSecret, timestamp, method, path, body);

const response = await fetch('https://api.bitxpay.com/v1/payments', {
  method: 'POST',
  headers: {
    'X-API-Key': apiKey,
    'X-Signature': signature,
    'X-Timestamp': timestamp,
    'Content-Type': 'application/json'
  },
  body: body
});
```

```python [Python]
import hmac
import hashlib
import time
import requests

def generate_signature(api_secret, timestamp, method, path, body=''):
    message = f'{timestamp}{method}{path}{body}'
    return hmac.new(
        api_secret.encode(),
        message.encode(),
        hashlib.sha256
    ).hexdigest()

# Example usage
api_key = 'your-api-key'
api_secret = 'your-api-secret'
timestamp = str(int(time.time() * 1000))
method = 'POST'
path = '/v1/payments'
body = '{"amount":"100.00","currency":"USD"}'

signature = generate_signature(api_secret, timestamp, method, path, body)

response = requests.post(
    'https://api.bitxpay.com/v1/payments',
    headers={
        'X-API-Key': api_key,
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json'
    },
    data=body
)
```

:::

## API key permissions

When creating API keys, you can optionally restrict their permissions to specific operations:

- **Read-only**: Query balances and transaction history
- **Payment creation**: Create payment links and invoices
- **Full access**: All operations including withdrawals

## Security best practices

### 1. Never embed keys in code
Embedding API keys in code increases the risk of accidental exposure. When sharing code, you might forget to remove embedded keys.

**Instead**: Store keys in environment variables or files outside your application's source tree.

### 2. Never store keys inside your source tree
Keep API key files outside your application's source tree to prevent them from being committed to version control systems like GitHub.

### 3. Restrict signatures to specific APIs
When multiple APIs are enabled in your project, restrict JWT token usage to specific APIs to prevent replay attacks. Include the API request path in the signing body to ensure signatures work only for their intended API.

### 4. Delete unused keys
Remove API keys you no longer need to minimize the attack surface.

### 5. Rotate keys periodically
Regular key rotation reduces the risk of long-term key compromise. Since BITXpay Developer Platform uses asymmetric cryptography, key rotation requires creating new keys and deleting old ones.

### Additional recommendations

- Monitor API key usage for suspicious activity
- Implement rate limiting on your endpoints
- Use HTTPS for all API communications
- Always validate SSL certificates when connecting over HTTPS
- Log and audit API key usage
- Have an incident response plan for compromised keys
- Regularly review and update your security practices
- Consider using hardware security modules (HSMs) or secure enclaves for key storage in production
- Follow the principle of least privilege when granting API permissions
- Use separate keys for development, testing, and production environments
