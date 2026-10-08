---
title: Merchant API - Payments
description: Create and manage payment links for accepting cryptocurrency payments with the BITXpay Merchant API.
---

# Merchant API - Payments

## Overview

The Merchant API Payments endpoints allow you to create, manage, and retrieve payment links for accepting cryptocurrency payments. All endpoints require Merchant API Key authentication with an Ed25519 (EdDSA) request signature (RSA-PSS accepted for legacy keys). The signed path must include the `/api/v1` prefix; see [Authentication](/api-reference/authentication).

All responses except the catalog are wrapped as `{"message": string, "data": …}`; error responses carry only `message` (plus `error`/`code` for authentication errors).

**Base URL:** `{{ $api.sandbox.baseUrl }}`

**Authentication:** Merchant API Key (asymmetric Ed25519 / EdDSA signature)

---

## Supported Currencies

Payment links accept any `code` returned by the [Get Currencies](#1-get-currencies) endpoint. The list is environment-specific and changes over time, so fetch it rather than hard-coding codes. At the time of writing the sandbox returns 54 records covering AAVE, ARB, BNB, BTC, ETH, EURC, GNO, LINK, OP, POL, SOL, TRX, UNI, USDC, USDCe, USDG, USDT, WAVAX, WBNB, WBTC, WETH, WPOL and the fiat codes AUD, CAD, CHF, EUR, GBP, USD.

::: warning One record per currency *and* network
The currencies endpoint returns one record per currency record in the catalogue, so the same `code` appears several times when a token exists on several networks (for example `USDT` seven times, `USDC` nine times in sandbox). Any of them is valid as the `currency` of a payment link; network selection happens at checkout. Deduplicate by `code` if you present the list to users.
:::

### Currency Validation

When creating a payment link:

1. **Currency code is required** - `Validation failed: currency is required` otherwise
2. **Case-insensitive** - `usdt`, `Usdt` and `USDT` are all accepted and stored as `USDT`
3. **Length**: 3-10 characters
4. **Must exist in the currencies list** - unknown codes are rejected with `invalid currency code 'XYZ': currency not found`
5. **Network selection** - happens automatically at checkout

**Examples:**
```json
{
  "currency": "USDT",  // ✅ Valid - Tether USD
  "currency": "usdt",  // ✅ Valid - normalised to USDT
  "currency": "ETH",   // ✅ Valid - Ethereum
  "currency": "XYZ"    // ❌ 400 - currency doesn't exist
}
```

---

## Endpoints

### 1. Get Currencies

Retrieve the list of currency records a payment link can be denominated in.

#### Request

**GET** `/payment_links/currencies`

#### Authentication

```
X-API-Key: btxm_9b451fa04a2e
X-API-Signature: <base64_encoded_ed25519_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Accept: application/json
```

This endpoint takes no query parameters; it always returns the full supported currency list.

#### Response (200 OK)

```json
{
  "message": "Currencies retrieved successfully",
  "data": [
    {
      "id": "25193059-4008-4522-8eb4-3c2583ee1ebf",
      "code": "USDT",
      "name": "Tether USD"
    },
    {
      "id": "eff091bc-223e-4326-b64f-140625b3f008",
      "code": "USDC",
      "name": "USD Coin"
    },
    {
      "id": "a93e5a54-9725-4af1-85be-c389ce485017",
      "code": "ETH",
      "name": "Ethereum"
    },
    {
      "id": "0c2b4a1e-5f6d-4a7b-9c8d-1e2f3a4b5c6d",
      "code": "USDT",
      "name": "Tether USD"
    }
    // ... more currencies; a code may appear more than once
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique identifier for the currency record |
| `code` | string | Currency code (use this when creating payment links) |
| `name` | string | Full currency name |

::: warning Multiple Networks
Some currencies like USDT and ETH are available on multiple networks (Ethereum, BSC, Polygon, etc.). This endpoint returns **one entry per currency record**, so a `code` can appear several times; network selection is handled automatically at checkout. When creating a payment link, you only need to specify the `code`.
:::

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key/signature |
| 500 | Internal Server Error | Server error |

#### Example Request

```bash
curl --location '{{ $api.sandbox.baseUrl }}{{ $api.endpoints.currencies }}' \
  --header 'X-API-Key: btxm_9b451fa04a2e' \
  --header 'X-API-Signature: <signature>' \
  --header 'X-API-Timestamp: 2026-01-31T12:00:00Z' \
  --header 'Accept: application/json'
```

---

### 2. Create Payment Link

Creates a new payment link for accepting payments.

#### Request

**POST** `/payment_links`

#### Authentication

```
X-API-Key: btxm_9b451fa04a2e
X-API-Signature: <base64_encoded_ed25519_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `payment_name` | string | Yes | Payment link name (1-100 chars) | "Invoice #12345" |
| `amount` | float | Yes | Payment amount (must be > 0) | 100.50 |
| `currency` | string | Yes | Currency code (3-10 chars, case-insensitive). Must be a `code` from the [currencies list](#1-get-currencies) | "USDT" |
| `description` | string | No | Payment description (max 1000 chars) | "Payment for Order #12345" |
| `expires_at` | timestamp | No | Expiration time (ISO 8601) | "2026-02-01T12:00:00Z" |
| `max_uses` | integer | No | Maximum number of uses (must be > 0) | 1 |
| `customer_id` | string | No | Merchant's customer ID (1-100 chars) | "AB-001" |
| `customer_name` | string | No | Customer name (1-100 chars) | "John Doe" |
| `customer_email` | string | No | Customer email (valid email) | "john@example.com" |
| `product_name` | string | No | Product name (1-200 chars) | "Course A" |
| `product_description` | string | No | Product description (max 1000 chars) | "Art Course for Beginners" |
| `cart` | object | No | Shopping cart details with items, subtotal, tax, and total | See cart object below |
| `order_id` | string | No | Merchant's order ID (auto-generated if not provided) | "ORD-20260226-A1B2C3" |
| `auto_fill` | boolean | No | Auto-generate `customer_id` / `order_id` when not provided (default: true) | true |
| `starts_at` | timestamp | No | Time from which the link can be paid (ISO 8601, default: now) | "2026-02-01T00:00:00Z" |
| `is_test` | boolean | No | Create a test payment link (default: false) | false |
| `success_url` | string | No | Redirect URL after success (valid URL, max 500 chars) | "https://www.success.io/success.html" |
| `cancel_url` | string | No | Redirect URL after cancellation (valid URL, max 500 chars) | "https://www.failure.io/cancel.html" |
| `webhook_metadata` | object | No | Custom metadata for webhooks | {"merchant_id": "M-10001"} |
| `checkout_mode` | string | No | Checkout flow mode | "redirect" |
| `origin` | string | No | Origin URL of the requesting application | "https://yoursite.com" |

**Cart Object Structure:**

```json
{
  "cart": {
    "items": [
      {
        "name": "Course A",
        "product_id": "prod_001",
        "quantity": 1,
        "unit_price": 100.50,
        "total": 100.50
      }
    ],
    "shipping": 0,
    "subtotal": 100.50,
    "tax": 0,
    "total": 100.50
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `items` | array | Yes | Array of cart items |
| `items[].name` | string | Yes | Item name |
| `items[].product_id` | string | No | Your internal product identifier |
| `items[].quantity` | integer | Yes | Item quantity (must be > 0) |
| `items[].unit_price` | float | Yes | Price per single unit |
| `items[].total` | float | Yes | Line total (quantity × unit_price) |
| `subtotal` | float | Yes | Subtotal amount |
| `shipping` | float | No | Shipping cost (default: 0) |
| `tax` | float | Yes | Tax amount |
| `total` | float | Yes | Total amount (should match payment amount) |

::: tip Response Variations
The core fields (`id`, `payment_name`, `amount`, `currency`, `payment_url`, `payment_status`, `payment_type`, `source`, `starts_at`, `expires_at`, `max_uses`, `current_uses`, `is_active`, `is_test`, `customer_id`, `order_id`, `auto_fill`, `created_at`) are always returned. Optional fields (`description`, `customer_name`, `customer_email`, `product_name`, `product_description`, `cart`, `success_url`, `cancel_url`, `webhook_metadata`) are returned only when you provided them. `customer_id` and `order_id` are auto-generated when omitted.
:::

#### Request Examples

**Minimal Request:**
```json
{
  "payment_name": "Invoice #12345",
  "amount": 100.50,
  "currency": "USDT"
}
```

**Full Request:**
```json
{
  "payment_name": "Invoice #12345",
  "description": "Payment for Order #12345",
  "amount": 100.50,
  "currency": "USDT",
  "expires_at": "2026-02-01T12:00:00Z",
  "max_uses": 1,
  "customer_id": "AB-001",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "product_name": "Course A",
  "product_description": "Art Course for Beginners",
  "cart": {
    "items": [
      {
        "name": "Course A",
        "product_id": "prod_001",
        "quantity": 1,
        "unit_price": 100.50,
        "total": 100.50
      }
    ],
    "shipping": 0,
    "subtotal": 100.50,
    "tax": 0,
    "total": 100.50
  },
  "checkout_mode": "redirect",
  "origin": "https://yoursite.com",
  "success_url": "https://www.success.io/success.html",
  "cancel_url": "https://www.failure.io/cancel.html",
  "webhook_metadata": {
    "merchant_id": "M-10001",
    "demo": true
  }
}
```

#### Response (201 Created)

The response structure varies based on the request parameters provided.

**Minimal Response** (when only required fields are provided):

```json
{
  "message": "Payment link created successfully",
  "data": {
    "id": "f7a9ff0a-678f-45ba-a918-dcafc5d479e9",
    "payment_name": "Invoice #12345",
    "amount": 100.5,
    "currency": "USDT",
    "payment_url": "sandboxpay.bitxpay.com/payment_link?payment_id=f7a9ff0a-678f-45ba-a918-dcafc5d479e9",
    "payment_status": "processing",
    "payment_type": "one_time",
    "source": "payment_link_api",
    "starts_at": "2026-03-12T15:21:12.988351Z",
    "expires_at": "2026-03-13T15:21:12.988351519Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "is_test": false,
    "customer_id": "CUST-20260312-96D009D4",
    "order_id": "ORD-20260312-E29917C9",
    "auto_fill": true,
    "created_at": "2026-03-12T15:21:12.988356Z"
  }
}
```

**Full Response** (when optional fields like cart, customer details are provided):

```json
{
  "message": "Payment link created successfully",
  "data": {
    "id": "d26ffcc8-f013-464e-893a-d71ee1e849ae",
    "payment_name": "Invoice #12345",
    "description": "Payment for Order #12345",
    "amount": 100.5,
    "currency": "USDT",
    "payment_url": "sandboxpay.bitxpay.com/payment_link?payment_id=d26ffcc8-f013-464e-893a-d71ee1e849ae",
    "payment_status": "processing",
    "payment_type": "one_time",
    "source": "payment_link_api",
    "starts_at": "2026-07-05T07:30:05.703759Z",
    "expires_at": "2026-02-01T12:00:00Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "is_test": false,
    "customer_id": "AB-001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "product_name": "Course A",
    "product_description": "Art Course for Beginners",
    "cart": {
      "items": [
        {
          "name": "Course A",
          "product_id": "prod_001",
          "quantity": 1,
          "unit_price": 100.5,
          "total": 100.5
        }
      ],
      "shipping": 0,
      "subtotal": 100.5,
      "tax": 0,
      "total": 100.5
    },
    "order_id": "ORD-20260226-A1B2C3",
    "auto_fill": true,
    "success_url": "https://www.success.io/success.html",
    "cancel_url": "https://www.failure.io/cancel.html",
    "webhook_metadata": {
      "merchant_id": "M-10001",
      "demo": true
    },
    "created_at": "2026-07-05T07:30:05.703759Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique payment link identifier |
| `payment_name` | string | Payment link name |
| `description` | string | Payment description (if provided) |
| `amount` | float | Payment amount |
| `currency` | string | Currency code |
| `payment_url` | string | Checkout page for customers. Currently returned **without a scheme** (`sandboxpay.bitxpay.com/payment_link?payment_id=…`); prefix `https://` before using it |
| `payment_status` | string | `processing` on creation; later `completed`, `expired` or `cancelled` |
| `payment_type` | string | Payment type: `one_time`, `recurring` |
| `source` | string | Origin of the payment link: `payment_link_api` |
| `is_test` | boolean | Whether this is a test payment |
| `starts_at` | timestamp | Time from which the link can be paid (creation time unless provided) |
| `expires_at` | timestamp | Expiration timestamp (24 hours after creation unless provided) |
| `max_uses` | integer | Maximum number of uses allowed |
| `current_uses` | integer | Current number of uses |
| `is_active` | boolean | Whether the payment link is active |
| `customer_id` | string | Customer ID (auto-generated or provided) |
| `customer_name` | string | Customer name (if provided) |
| `customer_email` | string | Customer email (if provided) |
| `product_name` | string | Product name (if provided) |
| `product_description` | string | Product description (if provided) |
| `cart` | object | Shopping cart details (if provided) |
| `order_id` | string | Order ID (auto-generated or provided) |
| `auto_fill` | boolean | Auto-fill setting |
| `success_url` | string | Success redirect URL (if provided) |
| `cancel_url` | string | Cancel redirect URL (if provided) |
| `webhook_metadata` | object | Custom webhook metadata (if provided) |
| `created_at` | timestamp | Creation timestamp |

**Top-level response fields (alongside `data`):**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Human-readable result message |

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload, validation failed, or unsupported currency |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 409 | Conflict | Duplicate payment link or resource conflict |
| 500 | Internal Server Error | Server error |

**Common 400 Errors** (body is `{"message": "..."}`):
- `Invalid request payload` - body is not valid JSON
- `Validation failed: currency is required` - missing `currency`
- `Validation failed: amount is required` - missing, zero or negative `amount`
- `Validation failed: payment_name must be at most 100 characters`
- `Validation failed: customer_email must be a valid email address`
- `invalid currency code 'XYZ': currency not found` - code not in the currencies list

---

### 3. List Payment Links

Retrieve all payment links for the authenticated merchant with filtering, searching, and pagination.

#### Request

**GET** `/payment_links?page=1&limit=20&status=pending&currency=USDT&sort_by=created_at&sort_order=desc`

#### Query Parameters

| Parameter | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `page` | integer | 1 | Page number (min: 1; out-of-range values fall back to 1) | 1 |
| `limit` | integer | 20 | Items per page (max: 100; out-of-range values fall back to 20) | 20 |
| `status` | string | - | Filter by status: `pending`, `completed`, `expired`, `cancelled` (`processing` is **not** accepted here and returns 400) | "pending" |
| `is_active` | boolean | - | Filter by active status | true |
| `currency` | string | - | Filter by currency (3-10 chars) | "USDT" |
| `min_amount` | float | - | Minimum amount filter (must be > 0) | 10.00 |
| `max_amount` | float | - | Maximum amount filter (must be > 0) | 1000.00 |
| `created_from` | timestamp | - | Filter from date (ISO 8601) | "2026-01-01T00:00:00Z" |
| `created_to` | timestamp | - | Filter to date (ISO 8601) | "2026-01-31T23:59:59Z" |
| `search` | string | - | Search in name and description (max 100 chars) | "Invoice" |
| `sort_by` | string | created_at | Sort field: created_at, updated_at, amount, name | "created_at" |
| `sort_order` | string | desc | Sort order: asc, desc | "desc" |

#### Response (200 OK)

The response includes an array of payment links with varying detail levels based on how they were created.

```json
{
  "message": "Payment links retrieved successfully",
  "data": {
    "data": [
      {
        "id": "fce13397-afb5-4093-84c0-b64178691dbd",
        "payment_name": "Invoice #12345",
        "description": "Payment for Order #12345",
        "amount": 100.5,
        "currency": "USDT",
        "payment_url": "sandboxpay.bitxpay.com/payment_link?payment_id=fce13397-afb5-4093-84c0-b64178691dbd",
        "payment_status": "expired",
        "payment_type": "one_time",
        "source": "payment_link_api",
        "starts_at": "2026-03-12T15:23:32.084432Z",
        "expires_at": "2026-02-01T12:00:00Z",
        "max_uses": 1,
        "current_uses": 0,
        "is_active": true,
        "is_expired": true,
        "is_test": false,
        "customer_id": "AB-001",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "product_name": "Course A",
        "product_description": "Art Course for Beginners",
        "cart": {
          "items": [
            {
              "name": "Course A",
              "product_id": "prod_001",
              "quantity": 1,
              "unit_price": 100.5,
              "total": 100.5
            }
          ],
          "shipping": 0,
          "subtotal": 100.5,
          "tax": 0,
          "total": 100.5
        },
        "order_id": "ORD-20260226-A1B2C3",
        "auto_fill": true,
        "success_url": "https://www.success.io/success.html",
        "cancel_url": "https://www.failure.io/cancel.html",
        "webhook_metadata": {
          "merchant_id": "M-10001",
          "note": "Test payment",
          "source": "payment_link"
        },
        "created_at": "2026-03-12T15:23:32.084432Z"
      },
      {
        "id": "f7a9ff0a-678f-45ba-a918-dcafc5d479e9",
        "payment_name": "Invoice #12345",
        "amount": 100.5,
        "currency": "USDT",
        "payment_url": "sandboxpay.bitxpay.com/payment_link?payment_id=f7a9ff0a-678f-45ba-a918-dcafc5d479e9",
        "payment_status": "processing",
        "payment_type": "one_time",
        "source": "payment_link_api",
        "starts_at": "2026-03-12T15:21:12.988351Z",
        "expires_at": "2026-03-13T15:21:12.988351Z",
        "max_uses": 1,
        "current_uses": 0,
        "is_active": true,
        "is_expired": false,
        "is_test": false,
        "customer_id": "CUST-20260312-96D009D4",
        "order_id": "ORD-20260312-E29917C9",
        "auto_fill": true,
        "created_at": "2026-03-12T15:21:12.988356Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 20,
      "total_pages": 2,
      "total_records": 31,
      "has_next_page": true,
      "has_prev_page": false
    },
    "filters": {
      "sort_by": "created_at",
      "sort_order": "desc"
    }
  }
}
```

`filters` echoes every filter that was applied (`status`, `is_active`, `currency`, `min_amount`, `max_amount`, `created_from`, `created_to`, `search`, `sort_by`, `sort_order`). Items have the same shape as the [create response](#2-create-payment-link) plus `is_expired`. Soft-deleted links are not listed.

::: tip Response Variations
Payment links in the list may have different fields depending on how they were created:
- Links created with minimal data will only show core fields
- Links created with full details (cart, customer info) will include all those fields
:::

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid filter value, e.g. `Validation failed: Status must be one of: pending, completed, expired, cancelled` |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 500 | Internal Server Error | Server error |

---

### 4. Get Payment Link by ID

Retrieve a specific payment link with all related details including payers, transactions, and summary statistics.

#### Request

**GET** `/payment_links/{id}`

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Payment Link ID (UUID) | "22222222-2222-2222-2222-222222222222" |

#### Response (200 OK)

The response structure varies based on how the payment link was created.

**Full Response** (payment link created with complete details):

```json
{
  "message": "Payment link retrieved successfully",
  "data": {
    "id": "fce13397-afb5-4093-84c0-b64178691dbd",
    "payment_name": "Invoice #12345",
    "description": "Payment for Order #12345",
    "amount": 100.5,
    "currency": "USDT",
    "payment_url": "sandboxpay.bitxpay.com/payment_link?payment_id=fce13397-afb5-4093-84c0-b64178691dbd",
    "payment_status": "expired",
    "payment_type": "one_time",
    "source": "payment_link_api",
    "starts_at": "2026-03-12T15:23:32.084432Z",
    "expires_at": "2026-02-01T12:00:00Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "is_expired": true,
    "is_test": false,
    "customer_id": "AB-001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "product_name": "Course A",
    "product_description": "Art Course for Beginners",
    "cart": {
      "items": [
        {
          "name": "Course A",
          "product_id": "prod_001",
          "quantity": 1,
          "unit_price": 100.5,
          "total": 100.5
        }
      ],
      "shipping": 0,
      "subtotal": 100.5,
      "tax": 0,
      "total": 100.5
    },
    "order_id": "ORD-20260226-A1B2C3",
    "auto_fill": true,
    "success_url": "https://www.success.io/success.html",
    "cancel_url": "https://www.failure.io/cancel.html",
    "webhook_metadata": {
      "merchant_id": "M-10001",
      "note": "Test payment",
      "source": "payment_link"
    },
    "summary": {
      "total_payers": 0,
      "total_transactions": 0,
      "total_amount_received": 0,
      "total_amount_received_crypto": 0,
      "pending_transactions": 0,
      "completed_transactions": 0,
      "failed_transactions": 0
    },
    "created_at": "2026-03-12T15:23:32.084432Z"
  }
}
```

**Minimal Response** (payment link created with only required fields):

```json
{
  "message": "Payment link retrieved successfully",
  "data": {
    "id": "f7a9ff0a-678f-45ba-a918-dcafc5d479e9",
    "payment_name": "Invoice #12345",
    "amount": 100.5,
    "currency": "USDT",
    "payment_url": "sandboxpay.bitxpay.com/payment_link?payment_id=f7a9ff0a-678f-45ba-a918-dcafc5d479e9",
    "payment_status": "processing",
    "payment_type": "one_time",
    "source": "payment_link_api",
    "starts_at": "2026-03-12T15:21:12.988351Z",
    "expires_at": "2026-03-13T15:21:12.988351Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "is_expired": false,
    "is_test": false,
    "customer_id": "CUST-20260312-96D009D4",
    "order_id": "ORD-20260312-E29917C9",
    "auto_fill": true,
    "summary": {
      "total_payers": 0,
      "total_transactions": 0,
      "total_amount_received": 0,
      "total_amount_received_crypto": 0,
      "pending_transactions": 0,
      "completed_transactions": 0,
      "failed_transactions": 0
    },
    "created_at": "2026-03-12T15:21:12.988356Z"
  }
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique payment link identifier |
| `payment_name` | string | Payment link name |
| `description` | string | Payment description (if provided) |
| `amount` | float | Payment amount |
| `currency` | string | Currency code |
| `payment_url` | string | Checkout page for customers (currently without a scheme; prefix `https://`) |
| `payment_status` | string | Status: `processing`, `completed`, `expired`, `cancelled` |
| `payment_type` | string | Payment type: `one_time`, `recurring` |
| `source` | string | Origin of the payment link: `payment_link_api` |
| `starts_at` | timestamp | Time from which the link can be paid |
| `expires_at` | timestamp | Expiration timestamp |
| `max_uses` | integer | Maximum number of uses allowed |
| `current_uses` | integer | Current number of uses |
| `is_active` | boolean | Whether the payment link is active (merchant-controlled; distinct from `is_expired`) |
| `is_expired` | boolean | Whether the payment link's `expires_at` has passed |
| `is_test` | boolean | Whether this is a test payment |
| `settlement_status` | string | Settlement status, once a payment has been received (optional) |
| `usd_value` | float | USD value of the payment, once known (optional) |
| `payers` | array | Payers who paid this link (optional; see below) |
| `transactions` | array | On-chain transactions for this link (optional; see below) |
| `customer_id` | string | Customer ID (auto-generated or provided) |
| `customer_name` | string | Customer name (if provided) |
| `customer_email` | string | Customer email (if provided) |
| `product_name` | string | Product name (if provided) |
| `product_description` | string | Product description (if provided) |
| `cart` | object | Shopping cart details (if provided) |
| `order_id` | string | Order ID (auto-generated or provided) |
| `auto_fill` | boolean | Auto-fill setting |
| `success_url` | string | Success redirect URL (if provided) |
| `cancel_url` | string | Cancel redirect URL (if provided) |
| `webhook_metadata` | object | Custom webhook metadata (if provided) |
| `summary` | object | Transaction summary statistics |
| `summary.total_payers` | integer | Total number of unique payers |
| `summary.total_transactions` | integer | Total number of transactions |
| `summary.total_amount_received` | float | Total amount received in fiat |
| `summary.total_amount_received_crypto` | float | Total amount received in crypto |
| `summary.pending_transactions` | integer | Number of pending transactions |
| `summary.completed_transactions` | integer | Number of completed transactions |
| `summary.failed_transactions` | integer | Number of failed transactions |
| `created_at` | timestamp | Creation timestamp |

::: tip Summary Field
The `summary` object is always included in the response and provides real-time statistics about payments received for this payment link.
:::

**`payers[]` fields:** `id`, `name`, `email`, `created_at`, and optionally `country`, `phone`, `wallet_address`, `ip_address`, `region`.

**`transactions[]` fields:** `id`, `total_amount_crypto`, `network_id`, `network_name`, `created_at`, and optionally `total_amount_fiat`, `tx_hash`, `tx_hash_send_time`, `tx_confirmation_time`, `tx_block`, `payment_currency`, `contract_address`, `payment_type`, `status`, `payment_status`, `payment_wallet`.

Soft-deleted links are still returned by this endpoint (with `is_active: false`).

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid payment link ID format |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Payment link not found |
| 500 | Internal Server Error | Server error |

---

### 5. Delete Payment Link

Soft delete a payment link by its ID. The link is marked deleted and inactive, disappears from [List Payment Links](#3-list-payment-links), can no longer be paid, and any pending checkout order for it is voided. It remains readable via [Get Payment Link by ID](#4-get-payment-link-by-id).

#### Request

**DELETE** `/payment_links/{id}`

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Payment Link ID (UUID) | "22222222-2222-2222-2222-222222222222" |

#### Response (200 OK)

```json
{
  "message": "Payment link deleted successfully"
}
```

The response carries no `data` object. Deleting a link that is already deleted returns 200 again (the operation is idempotent).

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | `Invalid payment link ID` - not a UUID |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 500 | Internal Server Error | `Failed to delete payment link` - currently also returned when the ID does not exist or belongs to another merchant |

---

### 6. Update Payment Link Status

Deactivate, re-activate or expire a payment link without deleting it.

#### Request

**PUT** `/payment_links/{id}/status`

```json
{
  "status": "deactivate"
}
```

| `status` | Effect |
|---|---|
| `deactivate` | Sets `is_active: false`. The link can no longer be paid but can be re-activated later. |
| `expire` | Sets `expires_at` to now and `is_active: false`, and voids any pending checkout order. Irreversible. |
| `activate` | Intended to set `is_active: true`. **Currently fails with 500** (`Failed to update payment link status`); re-activation is not available until this is fixed. |

#### Response (200 OK)

```json
{
  "message": "Payment link status updated to deactivate successfully",
  "data": {
    "id": "22222222-2222-2222-2222-222222222222",
    "payment_name": "Invoice #12345",
    "amount": 100.5,
    "currency": "USDT",
    "payment_url": "sandboxpay.bitxpay.com/payment_link?payment_id=22222222-2222-2222-2222-222222222222",
    "payment_status": "processing",
    "payment_type": "one_time",
    "source": "payment_link_api",
    "starts_at": "2026-01-31T10:00:00Z",
    "expires_at": "2026-02-01T12:00:00Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": false,
    "is_expired": false,
    "is_test": false,
    "customer_id": "AB-001",
    "order_id": "ORD-20260226-A1B2C3",
    "auto_fill": true,
    "created_at": "2026-01-31T10:00:00Z"
  }
}
```

`data` has the same shape as a [list item](#3-list-payment-links).

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | `Invalid payment link ID`, `Invalid request payload`, or `Validation failed: status must be one of: activate, deactivate, expire` |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 500 | Internal Server Error | Link not found, belongs to another merchant, or `status: activate` (see above) |

---

### 7. Get Checkout Catalog

Lists the chains, tokens and settlement currencies the hosted checkout can currently offer. Useful to know which networks a customer will be able to pay on.

#### Request

**GET** `/payment_links/catalog`

#### Response (200 OK)

```json
{
  "currencies": ["AUD", "CAD", "CHF", "EUR", "GBP", "USD"],
  "chains": [
    {
      "chain_id": 1,
      "family": "evm",
      "tokens": [
        {
          "token": "0x1abaea1f7c830bd89acc67ec4af516284b1bc33c",
          "symbol": "EURC",
          "decimals": 6,
          "currencies": ["AUD", "CAD", "CHF", "EUR", "GBP", "USD"]
        }
      ]
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `currencies` | array | Fiat settlement currencies the checkout can quote in |
| `chains[].chain_id` | integer | Chain ID (EVM chain ID, or an internal ID for non-EVM families) |
| `chains[].family` | string | `evm`, `tron`, `solana`, … |
| `chains[].tokens[].token` | string | Token contract address |
| `chains[].tokens[].symbol` | string | Token symbol |
| `chains[].tokens[].decimals` | integer | Token decimals |
| `chains[].tokens[].currencies` | array | Fiat currencies this token can settle |

This response is not wrapped in `message`/`data`.

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key/signature |
| 503 | Service Unavailable | Checkout engine disabled in this environment |

---

## Authentication

All requests require the following headers:

```
X-API-Key: btxm_9b451fa04a2e           # same format in sandbox and production
X-API-Signature: <base64_encoded_ed25519_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

### Signing Process

1. **Construct message:**
   ```
   message = METHOD + PATH + TIMESTAMP + BODY
   ```
   `PATH` is the full request path **including `/api/v1`** (e.g. `/api/v1/payment_links`), without the query string. `BODY` is the exact raw body string sent (empty for GET/DELETE).

2. **Sign with Ed25519 (EdDSA):**
   - Do not pre-hash — Ed25519 hashes the message internally (SHA-512)
   - Produce the raw 64-byte signature
   - Encode as Base64
   - *(Legacy RSA keys: sign with RSA-PSS + SHA-256 instead, then Base64-encode)*

3. **Include in request headers**

For detailed implementation examples in various languages, see the [Merchant API Authentication Guide](/api-reference/authentication).

---

## Rate Limiting

- **Create Payment Link, Get Currencies, Get Checkout Catalog:** 100 requests per minute per client IP (HTTP 429 `Too many requests, please try again later` when exceeded)
- **List / Get / Update status / Delete:** no endpoint-specific limit beyond the global API limit

---

## Common Use Cases

### Get Available Currencies

Before creating a payment link, fetch the list of supported currencies:

```bash
curl {{ $api.sandbox.baseUrl }}{{ $api.endpoints.currencies }} \
  -H "X-API-Key: btxm_9b451fa04a2e" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Accept: application/json"
```

### Create a Simple Payment Link

```bash
curl -X POST {{ $api.sandbox.baseUrl }}/payment_links \
  -H "X-API-Key: btxm_9b451fa04a2e" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_name": "Product Purchase",
    "amount": 99.99,
    "currency": "USDT"
  }'
```

### Create Payment Link with Full Details

```bash
curl -X POST {{ $api.sandbox.baseUrl }}/payment_links \
  -H "X-API-Key: btxm_9b451fa04a2e" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{
    "payment_name": "Premium Course",
    "amount": 299.99,
    "currency": "USDC",
    "description": "Advanced Web Development Course",
    "customer_email": "customer@example.com",
    "product_name": "Web Dev Pro",
    "success_url": "https://yoursite.com/success",
    "cancel_url": "https://yoursite.com/cancel"
  }'
```

### List Payment Links with Filters

```bash
curl {{ $api.sandbox.baseUrl }}/payment_links?status=pending&currency=USDT&limit=10 \
  -H "X-API-Key: btxm_9b451fa04a2e" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z"
```

### Delete a Payment Link

```bash
curl -X DELETE {{ $api.sandbox.baseUrl }}/payment_links/{id} \
  -H "X-API-Key: btxm_9b451fa04a2e" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json"
```

---

## Support

For questions or issues:

- **Documentation:** {{ $site.urls.support.documentation }}
- **Email:** {{ $site.urls.support.email }}
- **API Status:** {{ $site.urls.support.statusPage }}
