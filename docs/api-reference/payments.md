---
title: Payments API
description: Create and manage cryptocurrency payments with the BitXPay Payments API.
---

# Payments API

The Payments API allows you to create, retrieve, and manage cryptocurrency payments.

## Create Payment

Create a new payment request.

```http
POST /payments
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Payment amount |
| `currency` | string | Yes | Fiat currency (USD, EUR, etc.) |
| `crypto` | string | Yes | Cryptocurrency (BTC, ETH, USDT) |
| `description` | string | No | Payment description |
| `orderId` | string | No | Your internal order ID |
| `webhookUrl` | string | No | Webhook URL for notifications |
| `redirectUrl` | string | No | Redirect URL after payment |
| `expiresIn` | number | No | Expiration time in minutes (default: 60) |
| `metadata` | object | No | Custom metadata |

### Example Request

```bash
curl -X POST https://api.bitxpay.com/v1/payments \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Signature: SIGNATURE" \
  -H "X-Timestamp: TIMESTAMP" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "crypto": "BTC",
    "description": "Order #12345",
    "orderId": "order_12345",
    "webhookUrl": "https://your-site.com/webhooks/bitxpay",
    "redirectUrl": "https://your-site.com/payment/success"
  }'
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "pay_abc123",
    "status": "pending",
    "amount": 100.00,
    "currency": "USD",
    "cryptoAmount": 0.00245,
    "crypto": "BTC",
    "cryptoAddress": "bc1q...",
    "paymentUrl": "https://pay.bitxpay.com/pay_abc123",
    "qrCode": "https://api.bitxpay.com/v1/payments/pay_abc123/qr",
    "expiresAt": "2024-01-15T11:30:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## Get Payment

Retrieve a payment by ID.

```http
GET /payments/:id
```

### Example Request

```bash
curl https://api.bitxpay.com/v1/payments/pay_abc123 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Signature: SIGNATURE" \
  -H "X-Timestamp: TIMESTAMP"
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "pay_abc123",
    "status": "completed",
    "amount": 100.00,
    "currency": "USD",
    "cryptoAmount": 0.00245,
    "crypto": "BTC",
    "cryptoAddress": "bc1q...",
    "txHash": "abc123def456...",
    "confirmations": 3,
    "completedAt": "2024-01-15T10:45:00Z",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

## List Payments

Retrieve a list of payments.

```http
GET /payments
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `crypto` | string | Filter by cryptocurrency |
| `limit` | number | Number of results (default: 20, max: 100) |
| `offset` | number | Pagination offset |
| `from` | string | Start date (ISO 8601) |
| `to` | string | End date (ISO 8601) |

### Example Request

```bash
curl "https://api.bitxpay.com/v1/payments?status=completed&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Signature: SIGNATURE" \
  -H "X-Timestamp: TIMESTAMP"
```

## Cancel Payment

Cancel a pending payment.

```http
POST /payments/:id/cancel
```

### Example Request

```bash
curl -X POST https://api.bitxpay.com/v1/payments/pay_abc123/cancel \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Signature: SIGNATURE" \
  -H "X-Timestamp: TIMESTAMP"
```

## Payment Statuses

| Status | Description |
|--------|-------------|
| `pending` | Waiting for payment |
| `confirming` | Payment received, awaiting confirmations |
| `completed` | Payment confirmed and completed |
| `expired` | Payment expired |
| `cancelled` | Payment cancelled |
| `failed` | Payment failed |
