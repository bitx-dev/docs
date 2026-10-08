---
title: API Reference
description: Complete API reference for BITXpay cryptocurrency payment gateway.
---

# API Reference

This is the complete API reference for BITXpay. All endpoints use HTTPS and return JSON responses.

## Base URL

::: code-group

```text [Production]
https://api.bitxpay.com/api/v1
```

```text [Sandbox]
https://sandboxapi.bitxpay.com/api/v1
```

:::

## Authentication

All merchant API requests must include signature authentication headers. Merchant endpoints (Payment Links) use **Ed25519 (EdDSA) signature authentication** (RSA-PSS accepted for legacy keys). See [Authentication](/api-reference/authentication) for details.

**Merchant APIs (Ed25519 signature):**
```bash
X-API-Key: btxm_9b451fa04a2e           # same format in sandbox and production
X-API-Signature: <base64_encoded_ed25519_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
```

::: info HMAC authentication
An HMAC-SHA256 authentication scheme is planned for a future set of standard (non-merchant) APIs. It is **not yet available** — no live endpoints use it today. It will be documented here once those endpoints ship.
:::

## Endpoints

### Payments (Merchant API)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/payment_links/currencies` | Get supported currencies |
| `GET` | `/payment_links` | List all payment links |
| `POST` | `/payment_links` | Create a payment link |
| `GET` | `/payment_links/:id` | Get payment link by ID |
| `DELETE` | `/payment_links/:id` | Delete a payment link |

### Subscriptions — Authenticated (Merchant) Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/subscriptions/plans/` | Create a subscription plan |
| `GET` | `/subscriptions/plans/` | List subscription plans |
| `GET` | `/subscriptions/plans/:id` | Get subscription plan by ID |
| `PUT` | `/subscriptions/plans/:id` | Update a subscription plan |
| `DELETE` | `/subscriptions/plans/:id` | Deprecate a subscription plan |
| `POST` | `/subscriber/` | Create a subscriber |
| `GET` | `/subscriber/` | Get subscribers by merchant |
| `GET` | `/subscriber/plan/:plan_id` | Get subscribers by plan ID |
| `PUT` | `/subscriber/:id` | Update a subscriber |
| `GET` | `/subscriber/:id` | Get subscriber by ID |
| `GET` | `/invitations/` | Get invitations by plan ID |
| `GET` | `/subscriptions/link/` | List subscription links |
| `GET` | `/subscriptions/link/:id` | Get subscription link by ID |

These routes require Merchant API Key authentication (`X-API-Key`/`X-API-Signature` with Ed25519), same as the Payments API.

### Subscriptions — Public Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/public/subscriptions/plans/` | List public subscription plans |
| `GET` | `/public/subscriptions/plans/:id` | Get public subscription plan by ID |
| `GET` | `/public/subscriber/prepare` | Prepare subscription enrollment |
| `GET` | `/public/subscriber/:id` | Get subscriber by ID |
| `PUT` | `/public/subscriber/:id` | Update subscriber |
| `POST` | `/public/subscriptions/link/` | Create a subscription link |
| `GET` | `/public/subscriptions/link/:walletAddress` | Get subscription links by wallet address |
| `POST` | `/public/subscriptions/link/payment` | Record a subscription payment |
| `PUT` | `/public/subscriptions/link/:id` | Update a subscription link |
| `GET` | `/public/subscriptions/nft/:plan_id` | Get subscription NFT metadata |

These routes do not require merchant signature headers — they are called directly from the customer-facing wallet/checkout flow. See [Subscriptions](/api-reference/subscriptions) for full request/response details.

## Response Format

All responses follow a consistent format:

```json
{
  "message": "Human-readable result message",
  "data": {
    // Response data
  }
}
```

## Error Handling

Errors return appropriate HTTP status codes with a consistent error body:

```json
{
  "message": "Amount must be greater than 0",
  "error": "invalid_amount",
  "code": 400
}
```

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Human-readable description of the error |
| `error` | string | Machine-readable error slug (snake_case) |
| `code` | integer | HTTP status code, duplicated in the body for convenience |

### Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid API key |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |

## Rate Limits

Rate limits are enforced **per API key, per endpoint**. See the Rate Limiting section on the [Payments](/api-reference/payments#rate-limiting) page for exact limits (typically 10-30 requests/minute); for Subscriptions, see the [Rate Limiting](/api-reference/subscriptions#rate-limiting) note and contact your account team for current per-route limits.

| Environment | Account-level ceiling |
|-------------|-------|
| Sandbox | 100 requests/minute |
| Production | 1000 requests/minute |

The account-level ceiling above is a hard cap across all endpoints combined; the per-endpoint limits documented on each page are typically the binding (lower) limit you will hit first.

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705312200
```
