---
title: Authentication
description: Learn how to authenticate API requests with BITXpay.
---

# Authentication

All currently published BITXpay APIs (Payments and Subscriptions) use a single authentication method:

1. **Signature Authentication (Ed25519 / EdDSA)** - For merchant-facing APIs (Payment Links, etc.)

::: info Planned: HMAC-SHA256
A second scheme, HMAC-SHA256, is planned for a future set of standard (non-merchant) APIs. It has **no live endpoints today** and is not part of the current contract. It will be documented here once it ships.
:::

---

## Signature Authentication (Merchant APIs)

Merchant-facing APIs authenticate requests with an **asymmetric signature** over a canonical message. The current primitive is **Ed25519 (EdDSA)**; **RSA-PSS with SHA-256** is also accepted for legacy keys issued before Ed25519 was adopted.

::: tip Ed25519 vs legacy RSA-PSS
New merchant keys are **Ed25519**. Ed25519 is deterministic (no per-signature random nonce), produces a fixed 64-byte signature, and hashes the message internally with SHA-512 — you do not pre-hash the message. If your account was provisioned with an older **RSA** key, sign with **RSA-PSS + SHA-256** instead; the request headers and message format are identical.
:::

### Required Headers

| Header | Description |
|--------|-------------|
| `X-API-Key` | Your merchant API key |
| `X-API-Signature` | Signature of the canonical message, base64-encoded (raw 64-byte Ed25519 signature, or RSA-PSS signature for legacy keys) |
| `X-API-Timestamp` | ISO 8601 timestamp (e.g., `2026-01-31T17:53:56Z`) |
| `Content-Type` | `application/json` |

### Obtaining Your Keys

1. Log in to your [BITXpay Dashboard](https://sandbox.bitxpay.com/dashboard)
2. Navigate to **Developers** → **API Keys**
3. Generate your **Merchant API Key** and **Private Key**
4. Store both securely - the private key is shown only once

Your credentials will include:
- **API Key:** `btxm_test_xxxxxxxxxx` in sandbox, `btxm_live_xxxxxxxxxx` in production (public identifier)
- **Private Key:** Ed25519 private key in PKCS#8 PEM format (keep secret) — RSA private key in PEM for legacy accounts
- **Public Key:** Ed25519 public key in PEM format (for verification) — RSA public key for legacy accounts

::: warning Match key prefix to environment
Always pair `btxm_test_*` keys with the sandbox base URL and `btxm_live_*` keys with the production base URL. Mixing them will fail authentication.
:::

### Generating the Signature

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

**Legacy RSA-PSS keys:**
- **Algorithm:** RSA-PSS
- **Hash Function:** SHA-256 (also used for the MGF1 mask)
- **Key Size:** 2048 bits (minimum)
- **Output Format:** raw signature bytes, base64-encoded for transmission

**Important Security Notes:**
- Ed25519 signing is deterministic — there is no per-signature random nonce to manage, which removes the nonce-reuse key-leak risk of DSA/ECDSA.
- Keep your private key secret and never ship it in client-side code.
- Include a fresh `X-API-Timestamp` on every request (see [Timestamp Validation](#timestamp-validation)).

### Node.js Example

```javascript
import crypto from 'crypto';
import fs from 'fs';

function generateSignature(privateKeyPEM, method, path, timestamp, body = '') {
  const message = `${method}${path}${timestamp}${body}`;

  // Ed25519 (EdDSA): pass `null` as the algorithm — Ed25519 hashes the message
  // internally, so the message must NOT be pre-hashed.
  const signature = crypto.sign(null, Buffer.from(message, 'utf8'), privateKeyPEM);

  // Legacy RSA-PSS keys instead use:
  //   crypto.sign('sha256', Buffer.from(message, 'utf8'), {
  //     key: privateKeyPEM,
  //     padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  //     saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
  //   });

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
  customer_email: 'john@example.com',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel'
});

const signature = generateSignature(privateKey, method, path, timestamp, body);

// Make request
const response = await fetch(`https://sandboxapi.bitxpay.com/api/v1${path}`, {
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

    # Legacy RSA-PSS keys instead use:
    #   from cryptography.hazmat.primitives import hashes
    #   from cryptography.hazmat.primitives.asymmetric import padding
    #   signature = private_key.sign(
    #       message.encode('utf-8'),
    #       padding.PSS(mgf=padding.MGF1(hashes.SHA256()),
    #                   salt_length=padding.PSS.DIGEST_LENGTH),
    #       hashes.SHA256())

    return base64.b64encode(signature).decode('utf-8')

# Usage
with open('private-key.pem', 'r') as f:
    private_key = f.read()

api_key = os.environ.get('MERCHANT_API_KEY')

method = 'POST'
path = '/payment_links'
timestamp = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
body_data = {
    'payment_name': 'Invoice #12345',
    'amount': 100.50,
    'currency': 'USDT',
    'customer_email': 'john@example.com',
    'success_url': 'https://example.com/success',
    'cancel_url': 'https://example.com/cancel'
}
body = json.dumps(body_data)

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

### Testing with Postman

For easy testing with Postman, see our [Postman Setup Guide](/testing/postman-setup) which includes a pre-request script that automatically generates signatures.

### Timestamp Validation

Requests with timestamps older than **5 minutes** will be rejected:

```json
{
  "message": "Request timestamp is too old or invalid",
  "error": "unauthorized",
  "code": 401
}
```

Ensure your system clock is synchronized with NTP servers.

### Security Best Practices

::: warning
Keep your private key secure and never expose it in client-side code.
:::

1. **Store keys securely** - Use environment variables or a secrets manager
2. **Use HTTPS** - All API requests must use HTTPS
3. **Rotate keys periodically** - Generate new API keys regularly
4. **Limit key permissions** - Use keys with minimal required permissions
5. **Monitor API usage** - Check your dashboard for unusual activity
