---
title: API Reference
description: Complete API reference for BitXPay cryptocurrency payment gateway.
---

# API Reference

This is the complete API reference for BitXPay. All endpoints use HTTPS and return JSON responses.

## Base URL

::: code-group

```text [Production]
https://api.bitxpay.com/v1
```

```text [Sandbox]
https://sandbox-api.bitxpay.com/v1
```

:::

## Authentication

All API requests must include authentication headers. See [Authentication](./authentication) for details.

```bash
Authorization: Bearer YOUR_API_KEY
X-Signature: HMAC_SIGNATURE
X-Timestamp: UNIX_TIMESTAMP
```

## Endpoints

### Payments
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/payments` | Create a new payment |
| `GET` | `/payments/:id` | Get payment details |
| `GET` | `/payments` | List all payments |
| `POST` | `/payments/:id/cancel` | Cancel a payment |

### Wallets
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/wallets` | List all wallets |
| `GET` | `/wallets/:id` | Get wallet details |
| `GET` | `/wallets/:id/balance` | Get wallet balance |
| `GET` | `/wallets/:id/transactions` | List wallet transactions |

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
