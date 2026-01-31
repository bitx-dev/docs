---
title: Payment Links API
description: Create and manage payment links for cryptocurrency transactions with the BitXPay Payment Links API.
---

# Payment Links API Documentation

## Overview

The Payment Links API allows merchants to create, manage, and track payment links for cryptocurrency transactions. This API provides endpoints for creating payment links, updating their status, retrieving payment details, and listing all payment links.

**Base URL (Sandbox):** `https://sandboxapi.bitxpay.com/api/v1`

**Base URL (Production):** `https://api.bitxpay.com/api/v1`

---

## Authentication

All API requests require authentication using an API key passed in the request header.

### Header Format

```
X-API-Key: your_api_key_here
```

or

```
Authorization: Bearer your_access_token_here
```

---

## Endpoints

### 1. Create Payment Link

Creates a new payment link for processing cryptocurrency payments.

**Endpoint:** `POST /payments/links`

**Authentication:** Required (X-API-Key)

#### Request Headers

```
Content-Type: application/json
X-API-Key: your_api_key_here
```

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `merchant_key` | string | Yes | Unique merchant identifier |
| `order_currency` | string | Yes | 3-letter ISO 4217 currency code (e.g., USD, GBP, EUR) |
| `order_amount` | number | Yes | Payment amount (must be greater than 0) |
| `payment_name` | string | Yes | Descriptive name for the payment |
| `payer_id` | string | No | Unique identifier for the payer |
| `payer_name` | string | No | Full name of the payer |
| `payer_email` | string | Yes | Email address of the payer |
| `payer_phone` | string | No | Phone number of the payer (international format) |
| `payer_ip` | string | No | IP address of the payer |
| `success_url` | string | Yes | URL to redirect on successful payment |
| `cancel_url` | string | Yes | URL to redirect on cancelled payment |
| `webhook_data` | object | No | Custom data to be sent to webhook |

#### Request Example

```json
{
  "merchant_key": "mkey-ckfhqahxy04g6e4qs6t3f00nl",
  "order_currency": "USD",
  "order_amount": 10,
  "payment_name": "Premium Subscription",
  "payer_id": "TRE1787238200",
  "payer_name": "Alice Tan",
  "payer_email": "alice.tan@triple-a.io",
  "payer_phone": "+6591234567",
  "payer_ip": "203.116.172.50",
  "success_url": "https://www.success.io/success.html",
  "cancel_url": "https://www.failure.io/cancel.html",
  "webhook_data": {
    "order_id": "ABC12345-12"
  }
}
```

#### Success Response (200 OK)

```json
{
  "payment_reference": "SDF-453672-PMT",
  "name": "Premium Subscription",
  "order_currency": "USD",
  "order_amount": 10,
  "payment_status": "processing",
  "expiry_date": "2026-02-01T03:57:22Z",
  "hosted_url": "https://pay.bitxpay.com/link/SDF-453672-PMT",
  "token_type": "x-api-key",
  "expires_in": 1499,
  "is_active": true,
  "max_uses": 1,
  "current_uses": 0,
  "notify_secret": "Cf9mx4nAvRuy5vwBY2FCtaKr"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `payment_reference` | string | Unique reference ID for the payment |
| `name` | string | Name of the payment |
| `order_currency` | string | Currency code |
| `order_amount` | number | Payment amount |
| `payment_status` | string | Current status (processing, completed, failed, expired) |
| `expiry_date` | string | ISO 8601 datetime when the link expires |
| `hosted_url` | string | URL to the payment page |
| `token_type` | string | Type of authentication token |
| `expires_in` | number | Time in seconds until expiration |
| `is_active` | boolean | Whether the link is currently active |
| `max_uses` | number | Maximum number of times the link can be used |
| `current_uses` | number | Number of times the link has been used |
| `notify_secret` | string | Secret key for webhook verification |

#### Error Responses

**401 Unauthorized** - Missing or invalid authentication token

```json
{
  "error": "unauthorized",
  "message": "Missing or invalid access token",
  "code": 401
}
```

**400 Bad Request** - Validation errors

```json
{
  "error": "invalid_request",
  "message": "Validation failed",
  "code": 400,
  "details": [
    {
      "field": "order_amount",
      "issue": "must be greater than 0"
    },
    {
      "field": "order_currency",
      "issue": "must be a valid 3-letter ISO 4217 code (e.g. GBP, USD)"
    },
    {
      "field": "payer_email",
      "issue": "must be a valid email address"
    }
  ]
}
```

**422 Unprocessable Entity** - Business rule violation

```json
{
  "error": "unprocessable_entity",
  "message": "Maximum uses cannot exceed 100 for this account tier",
  "code": 422
}
```

---

### 2. Update Payment Link Status

Updates the status of an existing payment link (e.g., mark as expired or inactive).

**Endpoint:** `PATCH /payments/links/{id}`

**Authentication:** Required (X-API-Key)

#### Request Headers

```
Content-Type: application/json
X-API-Key: your_api_key_here
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string (UUID) | Yes | Unique identifier of the payment link |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New status (expired, inactive, cancelled) |

#### Request Example

```json
{
  "id": "b8b2362d-f30c-4d9b-9a2e-08fa183d0d49",
  "status": "expired"
}
```

#### Success Response (200 OK)

```json
{
  "payment_reference": "SDF-453672-PMT",
  "name": "order_123222",
  "order_currency": "USD",
  "order_amount": 10,
  "payment_status": "expired",
  "expiry_date": "2020-01-26T03:57:22Z",
  "hosted_url": "https://pay.bitxpay.com/link/SDF-453672-PMT",
  "token_type": "x-api-key",
  "expires_in": 0,
  "is_active": false,
  "max_uses": 1,
  "current_uses": 0,
  "notify_secret": "Cf9mx4nAvRuy5vwBY2FCtaKr"
}
```

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "unauthorized",
  "message": "Missing or invalid access token",
  "code": 401
}
```

**400 Bad Request**

```json
{
  "error": "invalid_request",
  "message": "Validation failed",
  "code": 400,
  "details": [
    {
      "field": "status",
      "issue": "must be one of: expired, inactive, cancelled"
    }
  ]
}
```

**404 Not Found**

```json
{
  "error": "not_found",
  "message": "Payment link not found",
  "code": 404
}
```

**422 Unprocessable Entity**

```json
{
  "error": "unprocessable_entity",
  "message": "Cannot update status of completed payment",
  "code": 422
}
```

---

### 3. Get Payment Details

Retrieves detailed information about a specific payment link, including payer information and transaction history.

**Endpoint:** `GET /payments/links/{payment_id}`

**Authentication:** Required (X-API-Key)

#### Request Headers

```
X-API-Key: your_api_key_here
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payment_id` | string (UUID) | Yes | Unique identifier of the payment |

#### Request Example

```
GET /payments/links/b8b2362d-f30c-4d9b-9a2e-08fa183d0d49
```

#### Success Response (200 OK)

```json
{
  "id": "3d0a5e66-f5a5-432e-86e6-e9405a94fba6",
  "name": "order_123222",
  "amount": 0.1,
  "currency": "GBP",
  "payment_type": "direct",
  "payment_status": "processing",
  "payment_link": "https://pay.bitxpay.com/payment_link?payment_id=3d0a5e66-f5a5-432e-86e6-e9405a94fba6",
  "expires_at": "2026-01-30T15:11:57Z",
  "is_active": true,
  "max_uses": 1,
  "current_uses": 0,
  "is_expired": false,
  "is_available": true,
  "decimals": 2,
  "usd_price": "0.7243",
  "payers": [
    {
      "id": "d540b44c-b10c-4ef3-92cb-5154b252bb46",
      "name": "hassan",
      "email": "hassaankazzmi@gmail.com",
      "country": "AF"
    }
  ],
  "merchant_customer": {
    "customer_id": "hs-032-026",
    "customer_name": "HSK",
    "email": "hassaankazzmi@gmail.com"
  },
  "txs": [
    {
      "t3a_id": "16ff14ea264ee91c5728a36b5b89b07122e58269ca682abcd3571dc634591d4e",
      "txid": "cba3bcf8e4d0d77e2b6af9f16dcc68ac3f5fa7432020d2368541b14bf547b09b",
      "order_currency": "USD",
      "receive_amount": 10,
      "status": "confirmed",
      "status_date": "2020-01-26T03:57:22Z",
      "payment_tier": "good",
      "payment_tier_date": "2020-01-26T03:57:22Z",
      "payment_currency": "USD",
      "payment_amount": 10,
      "payment_crypto_amount": 0.00001234
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique payment identifier |
| `name` | string | Payment name/description |
| `amount` | number | Payment amount |
| `currency` | string | Currency code |
| `payment_type` | string | Type of payment (direct, hosted, etc.) |
| `payment_status` | string | Current payment status |
| `payment_link` | string | Full URL to payment page |
| `expires_at` | string | ISO 8601 expiration datetime |
| `is_active` | boolean | Active status |
| `max_uses` | number | Maximum allowed uses |
| `current_uses` | number | Current use count |
| `is_expired` | boolean | Expiration status |
| `is_available` | boolean | Availability status |
| `decimals` | number | Decimal places for currency |
| `usd_price` | string | USD equivalent price |
| `payers` | array | List of payer information objects |
| `merchant_customer` | object | Merchant's customer information |
| `txs` | array | List of transaction objects |

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "unauthorized",
  "message": "Invalid or expired access token",
  "code": 401
}
```

**404 Not Found**

```json
{
  "error": "not_found",
  "message": "Payment not found",
  "code": 404
}
```

**400 Bad Request**

```json
{
  "error": "invalid_request",
  "message": "payment_id must be a valid UUID",
  "code": 400
}
```

---

### 4. List Payment Links

Retrieves a paginated list of all payment links with optional filtering.

**Endpoint:** `GET /payments/links`

**Authentication:** Required (Bearer Token)

#### Request Headers

```
Authorization: Bearer your_access_token_here
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (starts at 1) |
| `page_size` | integer | No | 20 | Number of items per page (1-100) |
| `statuses` | string | No | all | Comma-separated list of statuses to filter by |
| `currency` | string | No | all | Filter by currency code |
| `from_date` | string | No | - | Filter from this date (ISO 8601) |
| `to_date` | string | No | - | Filter until this date (ISO 8601) |

#### Request Example

```bash
curl -G "https://sandboxapi.bitxpay.com/api/v1/payments/links" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d page=1 \
  -d page_size=20 \
  -d statuses=active,processing
```

#### Success Response (200 OK)

```json
{
  "page": 1,
  "page_size": 20,
  "total_items": 78,
  "total_pages": 4,
  "has_more": true,
  "payment_links": [
    {
      "id": "3d0a5e66-f5a5-432e-86e6-e9405a94fba6",
      "name": "Order #123222 - Premium Membership",
      "amount": 249.99,
      "currency": "GBP",
      "status": "processing",
      "payment_link": "https://pay.bitxpay.com/link/3d0a5e66-f5a5-432e-86e6-e9405a94fba6",
      "expires_at": "2026-03-15T23:59:59Z",
      "is_active": true,
      "created_at": "2026-01-30T14:11:57Z"
    },
    {
      "id": "a2b3c4d5-e6f7-8901-2345-67890abcdef1",
      "name": "Invoice #INV-2024-001",
      "amount": 150.00,
      "currency": "USD",
      "status": "completed",
      "payment_link": "https://pay.bitxpay.com/link/a2b3c4d5-e6f7-8901-2345-67890abcdef1",
      "expires_at": "2026-02-28T23:59:59Z",
      "is_active": false,
      "created_at": "2026-01-28T10:30:00Z"
    }
  ]
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `page` | integer | Current page number |
| `page_size` | integer | Number of items per page |
| `total_items` | integer | Total number of payment links |
| `total_pages` | integer | Total number of pages |
| `has_more` | boolean | Whether more pages are available |
| `payment_links` | array | Array of payment link objects |

#### Error Responses

**401 Unauthorized**

```json
{
  "error": "unauthorized",
  "message": "Invalid or expired token",
  "code": 401
}
```

**400 Bad Request**

```json
{
  "error": "invalid_request",
  "message": "page_size must be between 1 and 100",
  "code": 400
}
```

---

## Payment Status Values

| Status | Description |
|--------|-------------|
| `pending` | Payment link created, awaiting payment |
| `processing` | Payment received, being processed |
| `completed` | Payment successfully completed |
| `failed` | Payment failed |
| `expired` | Payment link has expired |
| `cancelled` | Payment cancelled by user or merchant |
| `refunded` | Payment has been refunded |

---

## Webhook Notifications

When a payment status changes, BitXPay sends a POST request to your configured webhook URL with the following payload:

### Webhook Payload

```json
{
  "event_type": "payment.completed",
  "payment_id": "3d0a5e66-f5a5-432e-86e6-e9405a94fba6",
  "payment_reference": "SDF-453672-PMT",
  "status": "completed",
  "amount": 10,
  "currency": "USD",
  "webhook_data": {
    "order_id": "ABC12345-12"
  },
  "timestamp": "2026-01-31T12:00:00Z",
  "signature": "sha256_hash_of_payload"
}
```

### Verifying Webhook Signatures

Use the `notify_secret` from the payment creation response to verify webhook authenticity:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
```

---

## Rate Limits

- **Sandbox:** 100 requests per minute
- **Production:** 1000 requests per minute

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1643659200
```

---

## Testing

### Sandbox Environment

Use the following test credentials for sandbox testing:

**API Key:** `test_key_xxxxxxxxxxxxxxxx`

**Test Payment Amounts:**
- `10.00` - Will complete successfully
- `20.00` - Will fail
- `30.00` - Will remain in processing state

---

## Support

For API support, contact:
- **Email:** api-support@bitxpay.com
- **Documentation:** https://docs.bitxpay.com
- **Status Page:** https://status.bitxpay.com

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Create, update, retrieve, and list payment links
- Webhook notifications
- Full authentication support
