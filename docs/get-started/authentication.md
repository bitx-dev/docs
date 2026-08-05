# Authentication

Securing your BITXpay API keys is critical. Exposed credentials can lead to compromised accounts and financial loss.

## On this page
- [Overview](#overview)
- [Security overview](#security-overview)
- [Signature authentication (Ed25519) — merchant APIs](#signature-authentication-ed25519-merchant-apis)
- [HMAC-SHA256 — planned](#hmac-sha256-planned)
- [API key permissions](#api-key-permissions)
- [Security best practices](#security-best-practices)

## Overview

All currently published BITXpay APIs (Payments and Subscriptions) use a single authentication method for merchant-facing endpoints.

### Signature Authentication (Ed25519 / EdDSA)
**Merchant APIs**  
Payment links and other merchant-facing operations are authenticated with an **Ed25519 (EdDSA)** signature over a canonical message. **RSA-PSS with SHA-256** is also accepted for legacy keys issued before Ed25519 was adopted.

::: info Planned: HMAC-SHA256
An HMAC-SHA256 scheme is planned for a future set of standard (non-merchant) APIs. It has **no live endpoints today** and is not part of the current contract.
:::

## Security overview

::: danger Secret API keys must never appear in client side code or public repositories
These keys are for server side use only. If a secret key is exposed, delete it immediately from the dashboard and generate a new one.
:::

## Signature authentication (Ed25519) — merchant APIs

### Getting your keys

1. Log in to your [BITXpay Dashboard](https://sandbox.bitxpay.com/dashboard)
2. Navigate to **Developers** → **API Keys**
3. Generate your **Merchant API Key** and **Private Key**
4. Store both securely — the private key is shown only once

Your credentials will include:
- **API Key:** `btxm_test_xxxxxxxxxx` in sandbox, `btxm_live_xxxxxxxxxx` in production (public identifier)
- **Private Key:** Ed25519 private key in PKCS#8 PEM format (keep secret) — RSA private key in PEM for legacy accounts
- **Public Key:** Ed25519 public key in PEM format (for verification) — RSA public key for legacy accounts

### Required headers

```http
X-API-Key: btxm_test_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_ed25519_signature>
X-API-Timestamp: 2026-01-31T17:53:56Z
Content-Type: application/json
```

### Generating the signature

The signature is created by signing the canonical message with your private key:

**Message Format:**
```
METHOD + PATH + TIMESTAMP + BODY
```

**Example Message:**
```
POST/payment_links2026-01-31T17:53:56Z{"amount":100.50,"currency":"USDT","payment_name":"Invoice #12345"}
```

**Signature Parameters (Ed25519 — default):**
- **Algorithm:** Ed25519 (EdDSA)
- **Hashing:** performed internally by Ed25519 (SHA-512) — do **not** pre-hash the message
- **Signature size:** 64 bytes (fixed)
- **Output Format:** raw signature bytes, base64-encoded for transmission

**Legacy RSA-PSS keys:** RSA-PSS with SHA-256, 2048-bit minimum, raw signature bytes base64-encoded.

### Code examples

::: code-group

```javascript [Node.js]
import crypto from 'crypto';
import fs from 'fs';

function generateSignature(privateKeyPEM, method, path, timestamp, body = '') {
  const message = `${method}${path}${timestamp}${body}`;

  // Ed25519 (EdDSA): pass `null` as the algorithm — Ed25519 hashes the message
  // internally, so the message must NOT be pre-hashed.
  const signature = crypto.sign(null, Buffer.from(message, 'utf8'), privateKeyPEM);

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
  currency: 'USDT',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel'
});

const signature = generateSignature(privateKey, method, path, timestamp, body);

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
from cryptography.hazmat.primitives import serialization
import base64
from datetime import datetime, timezone
import json
import requests
import os

def generate_signature(private_key_pem, method, path, timestamp, body=''):
    message = f"{method}{path}{timestamp}{body}"

    private_key = serialization.load_pem_private_key(
        private_key_pem.encode(),
        password=None,
    )

    # Ed25519 (EdDSA) — no separate hash argument; Ed25519 hashes internally.
    signature = private_key.sign(message.encode('utf-8'))

    return base64.b64encode(signature).decode('utf-8')

# Usage
with open('private-key.pem', 'r') as f:
    private_key = f.read()

api_key = os.environ.get('MERCHANT_API_KEY')

method = 'POST'
path = '/payment_links'
timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
body = json.dumps({
    'payment_name': 'Invoice #12345',
    'amount': 100.50,
    'currency': 'USDT',
    'success_url': 'https://example.com/success',
    'cancel_url': 'https://example.com/cancel'
})

signature = generate_signature(private_key, method, path, timestamp, body)

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

## HMAC-SHA256 — planned

::: info Not yet available
An HMAC-SHA256 authentication scheme is planned for a future set of standard (non-merchant) APIs. **No live endpoints use it today**, and it is not part of the current contract. Header names, message format, and code samples will be documented here once those endpoints ship. Until then, use the Ed25519 signature scheme above for all merchant-facing requests.
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
