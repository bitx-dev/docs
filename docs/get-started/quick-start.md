# Quick Start

Get started with BITXpay in minutes. This guide will walk you through creating your first payment integration.

## Prerequisites

Before you begin, ensure you have:

- A BITXpay merchant account ([Sign up here](https://sandbox.bitxpay.com/auth/signup))
- API credentials (API Key and Ed25519 private key)
- Basic knowledge of REST APIs
- A development environment with Node.js, Python, or your preferred language

## Step 1: Get your API credentials

1. Log in to your [BITXpay Dashboard](https://sandbox.bitxpay.com/dashboard)
2. Navigate to **Developers** → **API Keys**
3. Click **Create API Key**
4. Save your API Key (`btxm_xxxxxxxxxxxx`) and private key (`Ed25519:…`, shown only once) securely

::: warning Keep your credentials safe
Never commit API keys or private keys to version control or expose them in client-side code.
:::

## Step 2: Make your first API call

Test your credentials by fetching the currencies your payment links can use. Every request is signed over `METHOD + PATH + TIMESTAMP + BODY`, where `PATH` is the **full path including `/api/v1`** and the private key is loaded straight from the `Ed25519:…` string the dashboard gave you.

::: code-group

```javascript [Node.js]
import crypto from 'crypto';

const apiKey = process.env.MERCHANT_API_KEY;              // btxm_xxxxxxxxxxxx
const raw = process.env.MERCHANT_PRIVATE_KEY;             // Ed25519:MC4CAQAw...
const privateKey = crypto.createPrivateKey({
  key: Buffer.from(raw.slice('Ed25519:'.length), 'base64'),
  format: 'der',
  type: 'pkcs8',
});

const host = 'https://sandboxapi.bitxpay.com';
const path = '/api/v1/payment_links/currencies';          // full path is signed
const timestamp = new Date().toISOString();
const message = `GET${path}${timestamp}`;                 // no body for GET
const signature = crypto.sign(null, Buffer.from(message, 'utf8'), privateKey).toString('base64');

const res = await fetch(host + path, {
  headers: {
    'X-API-Key': apiKey,
    'X-API-Signature': signature,
    'X-API-Timestamp': timestamp,
    'Accept': 'application/json',
  },
});
console.log(res.status, await res.json());
```

```python [Python]
import base64, os
from datetime import datetime, timezone
import requests
from cryptography.hazmat.primitives import serialization

api_key = os.environ["MERCHANT_API_KEY"]                    # btxm_xxxxxxxxxxxx
raw = os.environ["MERCHANT_PRIVATE_KEY"]                    # Ed25519:MC4CAQAw...
private_key = serialization.load_der_private_key(
    base64.b64decode(raw[len("Ed25519:"):]), password=None
)

host = "https://sandboxapi.bitxpay.com"
path = "/api/v1/payment_links/currencies"                   # full path is signed
timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
message = f"GET{path}{timestamp}"                           # no body for GET
signature = base64.b64encode(private_key.sign(message.encode())).decode()

res = requests.get(host + path, headers={
    "X-API-Key": api_key,
    "X-API-Signature": signature,
    "X-API-Timestamp": timestamp,
    "Accept": "application/json",
})
print(res.status_code, res.json())
```

:::

A `200` with `{"message": "Currencies retrieved successfully", "data": [...]}` means your key and signing are correct. A `401` with `code: "SIGNATURE_VERIFICATION_FAILED"` almost always means the signed path is missing the `/api/v1` prefix.

## Step 3: Create a payment

Create your first payment request:

::: code-group

<<< @/snippets/sign.mjs{javascript} [Node.js]

<<< @/snippets/sign.py{python} [Python]

:::

The response is `201 Created` with the link in `data`; the customer-facing checkout URL is `data.payment_url`. The URL comes from the deployment configuration; add `https://` only if it has no scheme. New links start in `payment_status: "processing"`.

## Step 4: Handle webhooks

Configure a webhook URL and secret in your dashboard, then verify `X-Webhook-Signature: sha256=<hex>` over the raw request body. Route events using `event_type`, for example `payment.succeeded`.

::: code-group

<<< @/snippets/webhook.mjs{javascript} [Express.js]

<<< @/snippets/webhook.py{python} [Flask]

:::

See [Webhooks](/get-started/webhooks) for signatures, retries, and duplicate handling, and [Webhook Event Data](/api-reference/webhook-events) for exact payload fields. In engine payment events, `data.payment_id` identifies the payment link; `data.link_id` is its display reference.

## Step 5: Test in sandbox

BITXpay provides a sandbox environment for testing:

- **Sandbox API**: `https://sandboxapi.bitxpay.com/api/v1`
- **Sandbox Dashboard**: [sandbox.bitxpay.com](https://sandbox.bitxpay.com)

Use sandbox credentials for development. For engine-backed checkout, explicitly set `is_test: true` to request a simulated order; choosing the sandbox host alone does not set test mode.

## Next steps

Now that you've created your first payment, explore more features:

- [Authentication](/get-started/authentication) - Learn about security best practices
- [Webhooks](/integration/webhooks) - Deep dive into webhook events
<!-- - [SDKs and Libraries](/get-started/sdks-libraries) - Use our official SDKs -->
- [API Reference](/api-reference/) - Explore all available endpoints

## Common issues

### Invalid signature error

Make sure you're:
- Using the correct Ed25519 private key
- Including the timestamp in the signature (ISO 8601 format)
- Formatting the message string correctly: `${method}${path}${timestamp}${body}` — e.g. `POST/api/v1/payment_links2026-01-31T12:00:00Z{...}`
- Signing with Ed25519 over `METHOD + /api/v1/... + TIMESTAMP + BODY` (do **not** pre-hash — Ed25519 hashes internally)
- Encoding the final signature as Base64

### Webhook not receiving events

Verify that:
- Your webhook URL is publicly accessible
- You're returning a 200 status code
- Your server supports HTTPS (required for production)

### Payment not completing

Check that:
- The merchant `amount` is a JSON number greater than zero
- The currency is supported
- The redirect URL is valid

For more troubleshooting help, see our [Troubleshooting Guide](/testing/troubleshooting).
