---
title: Authentication
description: How to authenticate Merchant API requests with an Ed25519 signature.
---

# Authentication

All currently published BITXpay Merchant APIs (Payments and Subscriptions) use a single authentication method:

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
| `X-API-Key` | Your merchant API key, e.g. `btxm_9b451fa04a2e` |
| `X-API-Signature` | Signature of the canonical message, base64-encoded (raw 64-byte Ed25519 signature, or RSA-PSS signature for legacy keys) |
| `X-API-Timestamp` | RFC 3339 / ISO 8601 timestamp in UTC (e.g., `2026-01-31T17:53:56Z`). Fractional seconds are accepted. |
| `Content-Type` | `application/json` (requests with a body) |

::: details Alternative: `Authorization: Bearer`
The API key may also be sent as `Authorization: Bearer btxm_…` instead of `X-API-Key`. `X-API-Key` takes precedence when both are present. The signature and timestamp headers are still required.
:::

### Obtaining Your Keys

1. Log in to your [BITXpay Dashboard](https://sandbox.bitxpay.com/dashboard)
2. Navigate to **Developers** → **API Keys**
3. Generate your **Merchant API Key** and **Private Key**
4. Store both securely - the private key is shown only once

Your credentials will include:

| Credential | Format | Example |
|---|---|---|
| **API Key** (public identifier) | `btxm_` + 12 hex characters | `btxm_9b451fa04a2e` |
| **Private Key** (keep secret) | `Ed25519:` + base64 of the PKCS#8 DER key | `Ed25519:MC4CAQAwBQYDK2VwBCIEI…` |
| **Public Key** (for your records) | `Ed25519:` + base64 of the SubjectPublicKeyInfo DER key | `Ed25519:MCowBQYDK2VwAyEA…` |

Legacy accounts have an RSA key pair in PEM format instead (`-----BEGIN PRIVATE KEY-----`).

::: warning The private key is not PEM
The issued private key is the `Ed25519:<base64>` string above, **not** a PEM file. Decode the base64 part and load it as a PKCS#8 DER key (see the examples below), or wrap it in `-----BEGIN PRIVATE KEY-----` / `-----END PRIVATE KEY-----` lines (base64 lines of 64 characters) if your library only accepts PEM. Both encode the same key.
:::

::: warning Keys are bound to an environment
The API key looks the same in sandbox and production (`btxm_…`). A key created in the sandbox dashboard only authenticates against `{{ $api.sandbox.baseUrl }}`; a key created in the production dashboard only against `{{ $api.production.baseUrl }}`. Using a key against the other environment fails with `INVALID_API_KEY`.
:::

### Generating the Signature

The signature is created by signing the canonical message with your private key:

**Message Format:**
```
METHOD + PATH + TIMESTAMP + BODY
```

| Part | Value |
|---|---|
| `METHOD` | Upper-case HTTP method, e.g. `POST` |
| `PATH` | The **full request path including the `/api/v1` prefix**, without host or query string, e.g. `/api/v1/payment_links` |
| `TIMESTAMP` | The exact string sent in `X-API-Timestamp` |
| `BODY` | The exact raw request body string sent on the wire (empty string for requests without a body) |

There are no separators between the parts.

**Example Message:**
```
POST/api/v1/payment_links2026-01-31T17:53:56Z{"amount":100.50,"currency":"USDT","payment_name":"Invoice #12345"}
```

::: danger Sign the full path
The server verifies the signature against the path it received, which includes `/api/v1`. Signing `/payment_links` while calling `{{ $api.sandbox.baseUrl }}/payment_links` fails with `SIGNATURE_VERIFICATION_FAILED`. Query strings (`?page=1`) are **not** part of the signed path.
:::

::: warning Body must match byte-for-byte
Sign the exact string you send. Serialise the JSON once, sign that string, and send that same string. Do not let your HTTP client re-serialise the object (for example use `data=body` rather than `json=body` in Python `requests`).
:::

**Signature Parameters (Ed25519 — default):**
- **Algorithm:** Ed25519 (EdDSA)
- **Hashing:** performed internally by Ed25519 (SHA-512) — do **not** pre-hash the message
- **Signature size:** 64 bytes (fixed)
- **Output Format:** raw signature bytes, base64-encoded for transmission

**Legacy RSA-PSS keys:**
- **Algorithm:** RSA-PSS
- **Hash Function:** SHA-256 (also used for the MGF1 mask)
- **Salt length:** equal to the digest length (32 bytes)
- **Key Size:** 2048 bits (minimum)
- **Output Format:** raw signature bytes, base64-encoded for transmission

**Important Security Notes:**
- Ed25519 signing is deterministic — there is no per-signature random nonce to manage, which removes the nonce-reuse key-leak risk of DSA/ECDSA.
- Keep your private key secret and never ship it in client-side code.
- Include a fresh `X-API-Timestamp` on every request (see [Timestamp Validation](#timestamp-validation)).

### Node.js Example

Both examples below were run as-is against the sandbox.

<<< @/snippets/sign.mjs{javascript}

### Python Example

<<< @/snippets/sign.py{python}

### Testing with Postman

For easy testing with Postman, see our [Postman Setup Guide](/testing/postman-setup) which includes a pre-request script that automatically generates signatures.

### Timestamp Validation

`X-API-Timestamp` must parse as RFC 3339 and be within **5 minutes** of the server clock, in either direction. Requests outside that window are rejected:

```json
{
  "error": "unauthorized",
  "message": "request timestamp expired. Maximum allowed time difference is 5 minutes",
  "code": "TIMESTAMP_EXPIRED",
  "time_diff_seconds": 360.4
}
```

Ensure your system clock is synchronized with NTP servers.

### Authentication Errors

All authentication failures return a JSON body with `error`, `message` and a string `code`:

| HTTP | `code` | When |
|---|---|---|
| 401 | `API_KEY_REQUIRED` | Neither `X-API-Key` nor `Authorization` is present |
| 401 | `INVALID_API_KEY_FORMAT` | Key does not start with `btxm_` |
| 401 | `INVALID_API_KEY_LENGTH` | Key shorter than 17 characters |
| 401 | `INVALID_API_KEY` | Key unknown in this environment, or deactivated |
| 401 | `API_KEY_EXPIRED` | Key past its expiry date |
| 401 | `SIGNATURE_REQUIRED` | `X-API-Signature` missing |
| 401 | `TIMESTAMP_REQUIRED` | `X-API-Timestamp` missing |
| 401 | `INVALID_TIMESTAMP_FORMAT` | Timestamp is not RFC 3339 |
| 401 | `TIMESTAMP_EXPIRED` | Timestamp more than 5 minutes from server time |
| 401 | `SIGNATURE_VERIFICATION_FAILED` | Signature does not verify against the key's public key |
| 403 | `MERCHANT_ACCOUNT_INACTIVE` | The merchant account is not active |
| 403 | `DOMAIN_NOT_AUTHORIZED` | Key is restricted to a domain and the request `Origin`/`Referer` does not match |
| 403 | `INSUFFICIENT_SCOPES` | Key lacks a scope required by the endpoint |

A failed signature check also echoes what the server signed over, which is the quickest way to spot a path or body mismatch:

```json
{
  "error": "unauthorized",
  "message": "signature verification failed: Ed25519 signature verification failed",
  "code": "SIGNATURE_VERIFICATION_FAILED",
  "debug": {
    "method": "POST",
    "path": "/api/v1/payment_links",
    "body_length": 71,
    "message_hash": ""
  }
}
```

### Security Best Practices

::: warning
Keep your private key secure and never expose it in client-side code.
:::

1. **Store keys securely** - Use environment variables or a secrets manager
2. **Use HTTPS** - All API requests must use HTTPS
3. **Rotate keys periodically** - Generate new API keys regularly
4. **Limit key permissions** - Use keys with minimal required scopes, and set a domain restriction where applicable
5. **Monitor API usage** - Check your dashboard for unusual activity
