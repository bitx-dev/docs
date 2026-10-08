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

| Credential | Format | Example |
|---|---|---|
| **API Key** (public identifier) | `btxm_` + 12 hex characters, same shape in sandbox and production | `btxm_9b451fa04a2e` |
| **Private Key** (keep secret) | `Ed25519:` + base64 of the PKCS#8 DER key (not PEM) | `Ed25519:MC4CAQAwBQYDK2VwBCIEI…` |
| **Public Key** | `Ed25519:` + base64 of the SubjectPublicKeyInfo DER key | `Ed25519:MCowBQYDK2VwAyEA…` |

Legacy accounts have an RSA key pair in PEM format instead. A key only works in the environment whose dashboard issued it.

### Required headers

```http
X-API-Key: btxm_9b451fa04a2e
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

`PATH` is the **full request path including `/api/v1`** (no host, no query string); `BODY` is the exact raw body string you send (empty for GET). There are no separators.

::: danger Sign the full path
Signing `/payment_links` while calling `{{ $api.sandbox.baseUrl }}/payment_links` fails with `SIGNATURE_VERIFICATION_FAILED`. Sign `/api/v1/payment_links`.
:::

**Example Message:**
```
POST/api/v1/payment_links2026-01-31T17:53:56Z{"amount":100.50,"currency":"USDT","payment_name":"Invoice #12345"}
```

**Signature Parameters (Ed25519 — default):**
- **Algorithm:** Ed25519 (EdDSA)
- **Hashing:** performed internally by Ed25519 (SHA-512) — do **not** pre-hash the message
- **Signature size:** 64 bytes (fixed)
- **Output Format:** raw signature bytes, base64-encoded for transmission

**Legacy RSA-PSS keys:** RSA-PSS with SHA-256, 2048-bit minimum, raw signature bytes base64-encoded.

### Code examples

::: code-group

<<< @/snippets/sign.mjs{javascript} [Node.js]

<<< @/snippets/sign.py{python} [Python]

:::

Both samples were run as-is against the sandbox. The private key is loaded straight from the `Ed25519:…` string the dashboard shows.

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
