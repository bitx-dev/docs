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

All merchant API requests must include signature authentication headers. Merchant endpoints (payment links and `/merchant/...` subscriptions) use **Ed25519 (EdDSA) signature authentication** (RSA-PSS accepted for legacy keys). See [Authentication](/api-reference/authentication) for details.

**Merchant APIs (Ed25519 signature):**
```bash
X-API-Key: btxm_9b451fa04a2e           # same format in sandbox and production
X-API-Signature: <base64_encoded_ed25519_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
```

Payer checkout routes under `/public/...` do not use merchant credentials. Dashboard APIs, including webhook management, use a dashboard session. Never embed your merchant private key in a checkout page.

## Endpoints

### Payments (Merchant API)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/payment_links/currencies` | Get currencies; optionally filter by `currency_type=fiat` or `crypto` |
| `GET` | `/payment_links/catalog` | Discover available checkout chains, tokens, and settlement currencies |
| `GET` | `/payment_links` | List all payment links |
| `POST` | `/payment_links` | Create a payment link |
| `GET` | `/payment_links/:id` | Get payment link by ID |
| `PUT` | `/payment_links/:id/status` | Deactivate or expire a payment link |
| `DELETE` | `/payment_links/:id` | Soft-delete a payment link |

### Subscriptions — Authenticated (Merchant) Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/merchant/subscription_plans/` | Create a subscription plan |
| `GET` | `/merchant/subscription_plans/` | List subscription plans |
| `GET` | `/merchant/subscription_plans/:id` | Get subscription plan by ID |
| `PUT` | `/merchant/subscription_plans/:id` | Update a subscription plan |
| `POST` | `/merchant/subscribers/` | Create a subscriber |
| `GET` | `/merchant/subscribers/` | Get subscribers by merchant |
| `GET` | `/merchant/subscribers/plan/:plan_id` | Get subscribers by plan ID |
| `PUT` | `/merchant/subscribers/:id` | Update a subscriber |
| `GET` | `/merchant/subscribers/:id` | Get subscriber by ID |
| `GET` | `/merchant/subscribers/invitations` | Get merchant invitations |
| `GET` | `/merchant/subscription_links/` | List subscription links |
| `GET` | `/merchant/subscription_links/:id` | Get subscription link by ID |

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

### Payments — Public Checkout

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/public/payments/links/:id` | Get payer-facing payment link details |
| `GET` | `/public/payments/links/:id/validate` | Validate a payment link |
| `GET` | `/public/payments/engine/links/:id/options` | Get available network/token choices |
| `POST` | `/public/payments/engine/links/:id/quote` | Select or refresh a payment quote |
| `GET` | `/public/payments/engine/links/:id/state` | Poll order status and confirmations |

The engine checkout routes are mounted only when configured and enabled. See [Checkout](/api-reference/checkout) for request and response details.

### Webhook Management — Dashboard Session

Webhook configuration uses `/webhooks` with dashboard authentication. See [Webhook Management](/api-reference/webhooks) for every method, request/response, shared-secret behavior, polling, and test events. The [Webhook Event Data reference](/api-reference/webhook-events) documents all typed event payloads with field tables, examples, and a downloadable JSON Schema.

The generated [Request and Response Fields](/api-reference/data-models) reference tracks exact names, JSON types, serialization tags, and declared constraints for the current models, including public checkout and webhook management.

The generated [Route Inventory](/api-reference/public-api-routes) lists the registered integration routes and their authentication boundaries, including legacy checkout, metadata, contact/assets, development helpers, and the session-protected mass-payout group.

## Response Format

Merchant payment and subscription controllers generally return `message` and `data`:

```json
{
  "message": "Payment link created successfully",
  "data": {
    "id": "22222222-2222-2222-2222-222222222222",
    "payment_status": "processing"
  }
}
```

Message-only responses omit `data`. Payment list results nest records at `data.data` and pagination at `data.pagination`. Subscription lists wrap their endpoint-specific list object in `data`. The checkout catalog, engine payer routes, and subscription prepare response are unwrapped JSON objects.

## Error Handling

Use the HTTP status as the primary error indicator. Merchant controller errors generally return a message:

```json
{
  "message": "Invalid payment link ID"
}
```

Authentication middleware also returns `error` and a **string** `code`, such as `SIGNATURE_VERIFICATION_FAILED`. Engine errors may return `error` and `code`; do not assume a numeric `code` or a uniform error envelope for every route.

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

Rate limits are attached to individual routes. In this backend checkout, payment/default limiters are configured to 100 requests per minute. Merchant payment create/currency/catalog routes attach a limiter; list/get/status/delete do not attach a separate endpoint limiter. Subscription routes attach payment/default limiters. Limiter identity uses recognized user/API-key context, falling back to the client IP.

Handle HTTP `429`, honor `Retry-After` when present, and use response rate-limit headers when available. Global middleware or infrastructure can impose additional limits; the backend does not define separate sandbox/production account ceilings of 100/1000 requests per minute.
