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

All API requests must include authentication headers. See [Authentication](/api-reference/authentication) for details.

**Merchant APIs (DSA):**
```bash
X-API-Key: btxm_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
```

**Standard APIs (HMAC-SHA256):**
```bash
Authorization: Bearer YOUR_API_KEY
X-Signature: HMAC_SIGNATURE
X-Timestamp: UNIX_TIMESTAMP
```

## Endpoints

### Payments (Merchant API)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/currencies` | Get supported currencies |
| `GET` | `/payment_links` | List all payment links |
| `POST` | `/payment_links` | Create a payment link |
| `GET` | `/payment_links/:id` | Get payment link by ID |
| `DELETE` | `/payment_links/:id` | Delete a payment link |

### Subscriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/subscriptions/subscribers/createlink` | Create subscriber and generate subscription link |
| `GET` | `/public/subscriptions/link/{walletAddress}` | Get subscriptions by wallet address |

## Response Format

All responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## Error Handling

Errors return appropriate HTTP status codes with details:

```json
{
  "success": false,
  "error": {
    "code": "INVALID_AMOUNT",
    "message": "Amount must be greater than 0",
    "field": "amount"
  }
}
```

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

| Environment | Limit |
|-------------|-------|
| Sandbox | 100 requests/minute |
| Production | 1000 requests/minute |

Rate limit headers are included in every response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1705312200
```
