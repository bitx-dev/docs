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
Payment links and merchant-facing operations. Uses DSA (Digital Signature Algorithm) — FIPS 186-4 standard with SHA-256 hashing and DER encoding.

### HMAC-SHA256
**Standard payment APIs**  
Core payment operations. Uses HMAC-SHA256 with your API key and secret.

## Security overview

::: danger Secret API keys must never appear in client side code or public repositories
These keys are for server side use only. If a secret key is exposed, delete it immediately from the dashboard and generate a new one.
:::

## DSA signature — merchant APIs

### Getting your keys

1. Log in to your [BITXpay Dashboard](https://sandbox.bitxpay.com/dashboard)
2. Navigate to **Developers** → **API Keys**
3. Generate your **Merchant API Key** and **Private Key**
4. Store both securely — the private key is shown only once

Your credentials will include:
- **API Key:** `btxm_xxxxxxxxxx` (public identifier)
- **Private Key:** DSA private key in PEM format (keep secret)
- **Public Key:** DSA public key in PEM format (for verification)

### Required headers

```http
X-API-Key: btxm_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T17:53:56Z
Content-Type: application/json
```

### Generating the signature

The signature is created by signing a message with your DSA private key:

**Message Format:**
```
METHOD + PATH + TIMESTAMP + BODY
```

**Example Message:**
```
POST/payment_links2026-01-31T17:53:56Z{"amount":100.50,"currency":"USD","payment_name":"Invoice #12345"}
```

**Signature Parameters:**
- **Algorithm:** DSA (Digital Signature Algorithm)
- **Hash Function:** SHA-256
- **Key Size:** 2048 bits (minimum recommended)
- **Output Format:** DER-encoded signature, base64-encoded for transmission
- **Standard:** FIPS 186-4

### Code examples

::: code-group

```javascript [Node.js]
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
const path = '/payment_links';
const timestamp = new Date().toISOString();
const body = JSON.stringify({
  payment_name: 'Invoice #12345',
  amount: 100.50,
  currency: 'USD',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel'
});

const signature = generateDSASignature(privateKey, method, path, timestamp, body);

// Make request
const response = await fetch(`{{ $api.sandbox.baseUrl }}${path}`, {
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

```python [Python]
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
path = '/payment_links'
timestamp = datetime.utcnow().isoformat() + 'Z'
body = json.dumps({
    'payment_name': 'Invoice #12345',
    'amount': 100.50,
    'currency': 'USD',
    'success_url': 'https://example.com/success',
    'cancel_url': 'https://example.com/cancel'
})

signature = generate_dsa_signature(private_key, method, path, timestamp, body)

# Make request
response = requests.post(
    f'{{ $api.sandbox.baseUrl }}{path}',
    headers={
        'X-API-Key': api_key,
        'X-API-Signature': signature,
        'X-API-Timestamp': timestamp,
        'Content-Type': 'application/json'
    },
    data=body
)
```

:::

## HMAC-SHA256 — standard APIs

### Required headers

```http
Authorization: Bearer <your-api-key>
X-Signature: <hmac-sha256-signature>
X-Timestamp: <unix-timestamp>
Content-Type: application/json
```

### Code examples

::: code-group

```javascript [Node.js]
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

  const response = await fetch(`{{ $api.sandbox.baseUrl }}${path}`, {
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

```python [Python]
import hmac
import hashlib
import time
import requests
import json
import os

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
        f'{{ $api.sandbox.baseUrl }}{path}',
        headers=headers,
        json=body
    )

    return response.json()
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
When multiple APIs are enabled in your project, restrict key usage to specific APIs to prevent replay attacks. Include the API request path in the signing body to ensure signatures work only for their intended API.

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
