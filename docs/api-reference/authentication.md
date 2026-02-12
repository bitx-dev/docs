---
title: Authentication
description: Learn how to authenticate API requests with BitXPay.
---

# Authentication

BitXPay supports two authentication methods depending on the API you're using:

1. **DSA Signature** - For merchant-facing APIs (Payment Links, etc.)
2. **HMAC-SHA256** - For standard payment APIs

---

## DSA Signature Authentication (Merchant APIs)

Merchant-facing APIs use DSA (Digital Signature Algorithm) for enhanced security. DSA is a FIPS 186-4 standard that provides efficient digital signatures with smaller signature sizes, making it ideal for bandwidth-sensitive merchant operations.

### Required Headers

| Header | Description |
|--------|-------------|
| `X-API-Key` | Your merchant API key |
| `X-API-Signature` | DSA signature of the request (base64-encoded DER format) |
| `X-API-Timestamp` | ISO 8601 timestamp (e.g., `2026-01-31T17:53:56Z`) |
| `Content-Type` | `application/json` |

### Obtaining Your Keys

1. Log in to your [BitXPay Dashboard](https://dashboard.bitxpay.com)
2. Navigate to **Settings** → **API Keys**
3. Generate your **Merchant API Key** and **Private Key**
4. Store both securely - the private key is shown only once

Your credentials will include:
- **API Key:** `bknn_xxxxxxxxxx` (public identifier)
- **Private Key:** DSA private key in PEM format (keep secret)
- **Public Key:** DSA public key in PEM format (for verification)

### Generating the Signature

The signature is created by signing a message with your DSA private key:

**Message Format:**
```
METHOD + PATH + TIMESTAMP + BODY
```

**Example Message:**
```
POST/payments/links2026-01-31T17:53:56Z{"merchant_key":"mkey-xxx","order_amount":10}
```

**Signature Parameters:**
- **Algorithm:** DSA (Digital Signature Algorithm)
- **Hash Function:** SHA-256
- **Key Size:** 2048 bits (minimum recommended)
- **Output Format:** DER-encoded signature, base64-encoded for transmission
- **Standard:** FIPS 186-4

**Important Security Notes:**
- DSA requires a unique random value (k) for each signature
- Never reuse the k value - this would leak your private key
- Use cryptographically secure random number generation

### Node.js Example

```javascript
import crypto from 'crypto';
import fs from 'fs';

function generateDSASignature(privateKeyPEM, method, path, timestamp, body = '') {
  const message = `${method}${path}${timestamp}${body}`;
  
  // DSA signature using SHA-256
  const signature = crypto.sign(
    'sha256',
    Buffer.from(message, 'utf8'),
    {
      key: privateKeyPEM,
      dsaEncoding: 'der' // DER encoding for DSA signature
    }
  );
  
  return signature.toString('base64');
}

// Usage
const privateKey = fs.readFileSync('private-key.pem', 'utf8');
const apiKey = process.env.MERCHANT_API_KEY;

const method = 'POST';
const path = '/payments/links';
const timestamp = new Date().toISOString();
const body = JSON.stringify({
  merchant_key: 'mkey-xxx',
  order_currency: 'USD',
  order_amount: 10,
  payment_name: 'Test Payment',
  payer_email: 'test@example.com',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel'
});

const signature = generateDSASignature(privateKey, method, path, timestamp, body);

// Make request
const response = await fetch(`https://api.bitxpay.com/api/v1${path}`, {
  method,
  headers: {
    'X-API-Key': apiKey,
    'X-API-Signature': signature,
    'X-API-Timestamp': timestamp,
    'Content-Type': 'application/json'
  },
  body
});
```

### Python Example

```python
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import dsa
from cryptography.hazmat.backends import default_backend
import base64
from datetime import datetime
import json
import requests
import os

def generate_dsa_signature(private_key_pem, method, path, timestamp, body=''):
    message = f"{method}{path}{timestamp}{body}"
    
    # Load DSA private key
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode(),
        password=None,
        backend=default_backend()
    )
    
    # Sign with DSA using SHA-256
    signature = private_key.sign(
        message.encode('utf-8'),
        hashes.SHA256()
    )
    
    # Return base64-encoded DER signature
    return base64.b64encode(signature).decode('utf-8')

# Usage
with open('private-key.pem', 'r') as f:
    private_key = f.read()

api_key = os.environ.get('MERCHANT_API_KEY')

method = 'POST'
path = '/payments/links'
timestamp = datetime.utcnow().isoformat() + 'Z'
body_data = {
    'merchant_key': 'mkey-xxx',
    'order_currency': 'USD',
    'order_amount': 10,
    'payment_name': 'Test Payment',
    'payer_email': 'test@example.com',
    'success_url': 'https://example.com/success',
    'cancel_url': 'https://example.com/cancel'
}
body = json.dumps(body_data)

signature = generate_dsa_signature(private_key, method, path, timestamp, body)

# Make request
response = requests.post(
    f'https://api.bitxpay.com/api/v1{path}',
    headers={
        'X-API-Key': api_key,
        'X-API-Signature': signature,
        'X-API-Timestamp': timestamp,
        'Content-Type': 'application/json'
    },
    data=body
)
```

### Testing with Postman

For easy testing with Postman, see our [Postman Setup Guide](/testing/postman-setup) which includes a pre-request script that automatically generates signatures.

### Timestamp Validation

Requests with timestamps older than **5 minutes** will be rejected:

```json
{
  "error": "unauthorized",
  "message": "Request timestamp is too old or invalid",
  "code": 401
}
```

Ensure your system clock is synchronized with NTP servers.

---

## HMAC-SHA256 Authentication (Standard APIs)

Standard payment APIs use HMAC-based authentication to secure API requests. Every request must include your API key and a signature.

## Required Headers

| Header | Description |
|--------|-------------|
| `Authorization` | Bearer token with your API key |
| `X-Signature` | HMAC-SHA256 signature of the request |
| `X-Timestamp` | Unix timestamp of the request |
| `Content-Type` | `application/json` |

## Generating the Signature

The signature is created by signing the request payload with your secret key:

```javascript
import crypto from 'crypto';

function generateSignature(secretKey, timestamp, method, path, body = '') {
  const payload = `${timestamp}${method}${path}${body}`;

  return crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');
}
```

## Complete Example

```javascript
import crypto from 'crypto';

const apiKey = process.env.BITXPAY_API_KEY;
const secretKey = process.env.BITXPAY_SECRET_KEY;

async function makeRequest(method, path, body = null) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = body ? JSON.stringify(body) : '';

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${timestamp}${method}${path}${bodyString}`)
    .digest('hex');

  const response = await fetch(`https://api.bitxpay.com/v1${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': 'application/json'
    },
    body: body ? bodyString : undefined
  });

  return response.json();
}

// Usage
const payment = await makeRequest('POST', '/payments', {
  amount: 100,
  currency: 'USD',
  crypto: 'BTC'
});
```

## Python Example

```python
import hmac
import hashlib
import time
import requests
import json

api_key = os.environ.get('BITXPAY_API_KEY')
secret_key = os.environ.get('BITXPAY_SECRET_KEY')

def make_request(method, path, body=None):
    timestamp = str(int(time.time()))
    body_string = json.dumps(body) if body else ''

    payload = f"{timestamp}{method}{path}{body_string}"
    signature = hmac.new(
        secret_key.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    headers = {
        'Authorization': f'Bearer {api_key}',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json'
    }

    response = requests.request(
        method,
        f'https://api.bitxpay.com/v1{path}',
        headers=headers,
        json=body
    )

    return response.json()
```

## Timestamp Validation

Requests with timestamps older than 5 minutes will be rejected:

```json
{
  "success": false,
  "error": {
    "code": "TIMESTAMP_EXPIRED",
    "message": "Request timestamp is too old"
  }
}
```

## Security Best Practices

::: warning
Keep your secret key secure and never expose it in client-side code.
:::

1. **Store keys securely** - Use environment variables or a secrets manager
2. **Use HTTPS** - All API requests must use HTTPS
3. **Rotate keys periodically** - Generate new API keys regularly
4. **Limit key permissions** - Use keys with minimal required permissions
5. **Monitor API usage** - Check your dashboard for unusual activity
