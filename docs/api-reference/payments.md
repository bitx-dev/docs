---
title: Merchant API - Payments
description: Create and manage payment links for accepting cryptocurrency payments with the BitXPay Merchant API.
---

# Merchant API - Payments

## Overview

The Merchant API Payments endpoints allow you to create, manage, and retrieve payment links for accepting cryptocurrency payments. All endpoints require Merchant API Key authentication with RSA-PSS signature verification.

**Base URL:** `https://api.bitxpay.com/payment_links`

**Authentication:** Merchant API Key (Asymmetric RSA-PSS)

---

## Endpoints

### 1. Create Payment Link

Creates a new payment link for accepting payments.

#### Request

**POST** `/payment_links`

#### Authentication

```
X-API-Key: btxm_live_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `payment_name` | string | Yes | Payment link name (1-100 chars) | "Invoice #12345" |
| `amount` | float | Yes | Payment amount (must be > 0) | 100.50 |
| `currency` | string | Yes | Currency code (3-10 chars) | "USD" |
| `description` | string | No | Payment description (max 1000 chars) | "Payment for Order #12345" |
| `expires_at` | timestamp | No | Expiration time (ISO 8601) | "2026-02-01T12:00:00Z" |
| `max_uses` | integer | No | Maximum number of uses (must be > 0) | 1 |
| `customer_id` | string | No | Merchant's customer ID (1-100 chars) | "AB-001" |
| `customer_name` | string | No | Customer name (1-100 chars) | "John Doe" |
| `customer_email` | string | No | Customer email (valid email) | "john@example.com" |
| `product_name` | string | No | Product name (1-200 chars) | "Course A" |
| `product_description` | string | No | Product description (max 1000 chars) | "Art Course for Beginners" |
| `success_url` | string | No | Redirect URL after success (valid URL, max 500 chars) | "https://www.success.io/success.html" |
| `cancel_url` | string | No | Redirect URL after cancellation (valid URL, max 500 chars) | "https://www.failure.io/cancel.html" |
| `webhook_metadata` | object | No | Custom metadata for webhooks | {"order_id": "12345"} |

#### Response (201 Created)

```json
{
  "message": "Payment link created successfully",
  "data": {
    "id": "22222222-2222-2222-2222-222222222222",
    "payment_name": "Invoice #12345",
    "description": "Payment for Order #12345",
    "amount": 100.50,
    "currency": "USD",
    "payment_url": "https://pay.bitxpay.com/p/22222222-2222-2222-2222-222222222222",
    "payment_status": "pending",
    "payment_type": "one_time",
    "expires_at": "2026-02-01T12:00:00Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "customer_id": "AB-001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "product_name": "Course A",
    "product_description": "Art Course for Beginners",
    "success_url": "https://www.success.io/success.html",
    "cancel_url": "https://www.failure.io/cancel.html",
    "webhook_metadata": {"order_id": "12345"},
    "created_at": "2026-01-31T10:00:00Z"
  }
}
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload or validation failed |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 409 | Conflict | Duplicate payment link or resource conflict |
| 500 | Internal Server Error | Server error |

---

### 2. List Payment Links

Retrieve all payment links for the authenticated merchant with filtering, searching, and pagination.

#### Request

**GET** `/payment_links?page=1&limit=20&status=pending&currency=USD&sort_by=created_at&sort_order=desc`

#### Query Parameters

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `page` | integer | 1 | Page number (min: 1) | 1 |
| `limit` | integer | 20 | Items per page (max: 100) | 20 |
| `status` | string | - | Filter by status: pending, completed, expired, cancelled | "pending" |
| `is_active` | boolean | - | Filter by active status | true |
| `currency` | string | - | Filter by currency (3-10 chars) | "USD" |
| `min_amount` | float | - | Minimum amount filter (must be > 0) | 10.00 |
| `max_amount` | float | - | Maximum amount filter (must be > 0) | 1000.00 |
| `created_from` | timestamp | - | Filter from date (ISO 8601) | "2026-01-01T00:00:00Z" |
| `created_to` | timestamp | - | Filter to date (ISO 8601) | "2026-01-31T23:59:59Z" |
| `search` | string | - | Search in name and description (max 100 chars) | "Invoice" |
| `sort_by` | string | created_at | Sort field: created_at, updated_at, amount, name | "created_at" |
| `sort_order` | string | desc | Sort order: asc, desc | "desc" |

#### Response (200 OK)

```json
{
  "message": "Payment links retrieved successfully",
  "data": {
    "data": [
      {
        "id": "22222222-2222-2222-2222-222222222222",
        "payment_name": "Invoice #12345",
        "description": "Payment for Order #12345",
        "amount": 100.50,
        "currency": "USD",
        "payment_url": "https://pay.bitxpay.com/p/22222222-2222-2222-2222-222222222222",
        "payment_status": "pending",
        "payment_type": "one_time",
        "expires_at": "2026-02-01T12:00:00Z",
        "max_uses": 1,
        "current_uses": 0,
        "is_active": true,
        "is_expired": false,
        "customer_id": "AB-001",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "product_name": "Course A",
        "product_description": "Art Course for Beginners",
        "success_url": "https://www.success.io/success.html",
        "cancel_url": "https://www.failure.io/cancel.html",
        "webhook_metadata": {"order_id": "12345"},
        "created_at": "2026-01-31T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 5,
      "total_records": 95,
      "has_next_page": true,
      "has_prev_page": false
    },
    "filters": {
      "status": "pending",
      "is_active": null,
      "currency": "USD",
      "min_amount": null,
      "max_amount": null,
      "created_from": null,
      "created_to": null,
      "search": null,
      "sort_by": "created_at",
      "sort_order": "desc"
    }
  }
}
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key/signature |
| 500 | Internal Server Error | Server error |

---

### 3. Get Payment Link by ID

Retrieve a specific payment link with all related details including payers, transactions, and summary statistics.

#### Request

**GET** `/payment_links/{id}`

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Payment Link ID (UUID) | "22222222-2222-2222-2222-222222222222" |

#### Response (200 OK)

```json
{
  "message": "Payment link retrieved successfully",
  "data": {
    "id": "22222222-2222-2222-2222-222222222222",
    "payment_name": "Invoice #12345",
    "description": "Payment for Order #12345",
    "amount": 100.50,
    "currency": "USD",
    "payment_url": "https://pay.bitxpay.com/p/22222222-2222-2222-2222-222222222222",
    "payment_status": "pending",
    "payment_type": "one_time",
    "expires_at": "2026-02-01T12:00:00Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "is_expired": false,
    "settlement_status": "pending",
    "usd_value": 100.50,
    "customer_id": "AB-001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "product_name": "Course A",
    "product_description": "Art Course for Beginners",
    "success_url": "https://www.success.io/success.html",
    "cancel_url": "https://www.failure.io/cancel.html",
    "webhook_metadata": {"order_id": "12345"},
    "payers": [
      {
        "id": "33333333-3333-3333-3333-333333333333",
        "name": "John Doe",
        "email": "john@example.com",
        "country": "United States",
        "phone": "+1234567890",
        "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "ip_address": "192.168.1.1",
        "region": "California",
        "created_at": "2026-01-31T10:05:00Z"
      }
    ],
    "transactions": [
      {
        "id": "44444444-4444-4444-4444-444444444444",
        "total_amount_fiat": 100.50,
        "total_amount_crypto": 0.0025,
        "tx_hash": "0xabc123...",
        "tx_hash_send_time": "2026-01-31T10:10:00Z",
        "tx_confirmation_time": "2026-01-31T10:15:00Z",
        "tx_block": 12345678,
        "network_id": "ethereum",
        "network_name": "Ethereum Mainnet",
        "payment_currency": "USDT",
        "contract_address": "0xdac17f958d2ee523a2206206994597c13d831ec7",
        "payment_type": "crypto",
        "status": "confirmed",
        "payment_status": "completed",
        "payment_wallet": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        "created_at": "2026-01-31T10:10:00Z"
      }
    ],
    "summary": {
      "total_payers": 3,
      "total_transactions": 3,
      "total_amount_received": 100.50,
      "total_amount_received_crypto": 0.0025,
      "pending_transactions": 0,
      "completed_transactions": 3,
      "failed_transactions": 0
    },
    "created_at": "2026-01-31T10:00:00Z"
  }
}
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid payment link ID format |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Payment link not found |
| 500 | Internal Server Error | Server error |

---

### 4. Update Payment Link Status

Update the status of a payment link (activate, deactivate, or expire).

#### Request

**PUT** `/payment_links/{id}/status`

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Payment Link ID (UUID) | "22222222-2222-2222-2222-222222222222" |

#### Request Body

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `status` | string | Yes | New status | active, inactive, expired |

#### Response (200 OK)

```json
{
  "message": "Payment link status updated to active successfully",
  "data": {
    "id": "22222222-2222-2222-2222-222222222222",
    "payment_name": "Invoice #12345",
    "description": "Payment for Order #12345",
    "amount": 100.50,
    "currency": "USD",
    "payment_url": "https://pay.bitxpay.com/p/22222222-2222-2222-2222-222222222222",
    "payment_status": "pending",
    "payment_type": "one_time",
    "expires_at": "2026-02-01T12:00:00Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "is_expired": false,
    "customer_id": "AB-001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "product_name": "Course A",
    "product_description": "Art Course for Beginners",
    "success_url": "https://www.success.io/success.html",
    "cancel_url": "https://www.failure.io/cancel.html",
    "webhook_metadata": {"order_id": "12345"},
    "created_at": "2026-01-31T10:00:00Z"
  }
}
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid status value or payment link ID |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Payment link not found |
| 500 | Internal Server Error | Server error |

---

## Authentication

All requests require the following headers:

```
X-API-Key: btxm_live_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_rsa_pss_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

### Signing Process

1. **Construct the message:**
   ```
   message = METHOD + PATH + TIMESTAMP + BODY
   ```

2. **Sign with RSA-PSS:**
   - Hash using SHA-256
   - Sign using RSA-PSS with salt length = 32 (PSS_SALTLEN_DIGEST)
   - Encode as Base64

3. **Include in request headers**

For detailed implementation examples in various languages, see the [Merchant API Authentication Guide](./authentication.md).

---

## Rate Limiting

- **Create Payment Link:** 10 requests per minute per API key
- **List Payment Links:** 30 requests per minute per API key
- **Get Payment Link:** 30 requests per minute per API key
- **Update Status:** 10 requests per minute per API key

---

## Common Use Cases

### Create a Simple Payment Link

```bash
curl -X POST https://api.bitxpay.com/payment_links \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_name": "Product Purchase",
    "amount": 99.99,
    "currency": "USD"
  }'
```

### List Payment Links with Filters

```bash
curl https://api.bitxpay.com/payment_links?status=pending&currency=USD&limit=10 \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z"
```

### Activate a Payment Link

```bash
curl -X PUT https://api.bitxpay.com/payment_links/{id}/status \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'
```

---

## Support

For questions or issues:

- **Documentation:** https://docs.bitxpay.com
- **Email:** support@bitxpay.com
- **API Status:** https://status.bitxpay.com
