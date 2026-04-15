---
title: Merchant API - Payments
description: Create and manage payment links for accepting cryptocurrency payments with the BITXpay Merchant API.
---

# Merchant API - Payments

## Overview

The Merchant API Payments endpoints allow you to create, manage, and retrieve payment links for accepting cryptocurrency payments. All endpoints require Merchant API Key authentication with DSA signature verification.

**Base URL:** `https://api.bitxpay.com/payment_links`

**Authentication:** Merchant API Key (Asymmetric DSA)

---

## Supported Cryptocurrencies

BITXpay supports multiple cryptocurrencies across various blockchain networks. When creating a payment link, you must specify a valid currency code.

### Available Currencies

| Currency Code | Name | Networks Available |
|--------------|------|-------------------|
| **AVAX** | Avalanche | 2 networks |
| **BNB** | BNB | 3 networks |
| **ETH** | Ethereum | 5 networks |
| **LINK** | ChainLink | 6 networks |
| **USDC** | USD Coin | 7 networks |
| **USDT** | Tether USD | 7 networks |
| **WBTC** | Wrapped BTC | 5 networks |
| **WETH** | Wrapped Ethereum | 6 networks |

::: tip Get Real-Time Currency List
Use the [Get Currencies](#1-get-currencies) endpoint to retrieve the current list of supported currencies with their network IDs.
:::

### Currency Validation

When creating a payment link:

1. **Currency code is required** - You must provide a valid currency code
2. **Case-sensitive** - Use uppercase currency codes (e.g., `USDT`, not `usdt`)
3. **Length**: 3-10 characters
4. **Network selection** - The system will automatically select an available network for the currency

**Example valid currencies:**
```json
{
  "currency": "USDT",  // ✅ Valid - Tether USD
  "currency": "ETH",   // ✅ Valid - Ethereum
  "currency": "USDC"   // ✅ Valid - USD Coin
}
```

**Invalid examples:**
```json
{
  "currency": "usdt",  // ❌ Invalid - must be uppercase
  "currency": "BTC",   // ❌ Invalid - not supported (use WBTC)
  "currency": "XYZ"    // ❌ Invalid - currency doesn't exist
}
```

---

## Endpoints

### 1. Get Currencies

Retrieve the complete list of supported cryptocurrencies with their network details.

#### Request

**GET** `/currencies?currency_type=string`

#### Authentication

```
X-API-Key: btxm_live_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Accept: application/json
```

#### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|------|
| `currency_type` | string | No | Filter by currency type | "string" |

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
    }
    // ... more currencies
  ]
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique network identifier for the currency |
| `code` | string | Currency code (use this when creating payment links) |
| `name` | string | Full currency name |

::: warning Multiple Networks
Some currencies like USDT and ETH are available on multiple networks (Ethereum, BSC, Polygon, etc.). Each network has a unique `id`. When creating a payment link, you only need to specify the `code` - the system will handle network selection.
:::

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key/signature |
| 500 | Internal Server Error | Server error |

#### Example Request

```bash
curl --location 'https://api.bitxpay.com/api/v1/currencies?currency_type=string' \
  --header 'X-API-Key: btxm_live_xxxxxxxxxxxx' \
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
| `currency` | string | Yes | Currency code (3-10 chars, uppercase). Must be a valid currency from [supported list](#supported-cryptocurrencies) | "USDT" |
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
| `auto_fill` | boolean | No | Auto-fill customer information (default: true) | true |
| `success_url` | string | No | Redirect URL after success (valid URL, max 500 chars) | "https://www.success.io/success.html" |
| `cancel_url` | string | No | Redirect URL after cancellation (valid URL, max 500 chars) | "https://www.failure.io/cancel.html" |
| `webhook_metadata` | object | No | Custom metadata for webhooks | {"merchant_id": "M-10001"} |

**Cart Object Structure:**

```json
{
  "cart": {
    "items": [
      {
        "name": "Course A",
        "quantity": 1,
        "price": 100.50
      }
    ],
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
| `items[].quantity` | integer | Yes | Item quantity (must be > 0) |
| `items[].price` | float | Yes | Item price (must be > 0) |
| `subtotal` | float | Yes | Subtotal amount |
| `tax` | float | Yes | Tax amount |
| `total` | float | Yes | Total amount (should match payment amount) |

::: tip Response Variations
The API returns different response structures based on the parameters you provide:
- **Minimal Request** (only required fields) → Returns minimal response with auto-generated `customer_id` and `order_id`
- **Full Request** (with optional fields like cart, customer details) → Returns complete response with all provided data
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
        "quantity": 1,
        "price": 100.50
      }
    ],
    "subtotal": 100.50,
    "tax": 0,
    "total": 100.50
  },
  "order_id": "ORD-20260226-A1B2C3",
  "auto_fill": true,
  "success_url": "https://www.success.io/success.html",
  "cancel_url": "https://www.failure.io/cancel.html",
  "webhook_metadata": {
    "merchant_id": "M-10001",
    "source": "payment_link",
    "note": "Test payment"
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
    "payment_url": "http://localhost:3000/payment_link?payment_id=f7a9ff0a-678f-45ba-a918-dcafc5d479e9",
    "payment_status": "processing",
    "payment_type": "one_time",
    "expires_at": "2026-03-13T15:21:12.988351519+05:00",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
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
    "id": "fce13397-afb5-4093-84c0-b64178691dbd",
    "payment_name": "Invoice #12345",
    "description": "Payment for Order #12345",
    "amount": 100.5,
    "currency": "USDT",
    "payment_url": "http://localhost:3000/payment_link?payment_id=fce13397-afb5-4093-84c0-b64178691dbd",
    "payment_status": "processing",
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
    "cart": {
      "items": [
        {
          "name": "Course A",
          "price": 100.5,
          "quantity": 1
        }
      ],
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
| `payment_url` | string | URL for customers to complete payment |
| `payment_status` | string | Status: `processing`, `completed`, `expired`, `cancelled` |
| `payment_type` | string | Payment type: `one_time`, `recurring` |
| `expires_at` | timestamp | Expiration timestamp |
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

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload, validation failed, or unsupported currency |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 409 | Conflict | Duplicate payment link or resource conflict |
| 500 | Internal Server Error | Server error |

**Common 400 Errors:**
- `Invalid currency code` - Currency not supported or doesn't exist
- `Currency code must be uppercase` - Use uppercase letters (e.g., USDT not usdt)
- `Currency is required` - Missing currency field

---

### 3. List Payment Links

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
        "payment_url": "http://localhost:3000/payment_link?payment_id=fce13397-afb5-4093-84c0-b64178691dbd",
        "payment_status": "processing",
        "payment_type": "one_time",
        "expires_at": "2026-02-01T12:00:00Z",
        "max_uses": 1,
        "current_uses": 0,
        "is_active": true,
        "is_expired": true,
        "customer_id": "AB-001",
        "customer_name": "John Doe",
        "customer_email": "john@example.com",
        "product_name": "Course A",
        "product_description": "Art Course for Beginners",
        "cart": {
          "items": [
            {
              "name": "Course A",
              "price": 100.5,
              "quantity": 1
            }
          ],
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
        "payment_url": "http://localhost:3000/payment_link?payment_id=f7a9ff0a-678f-45ba-a918-dcafc5d479e9",
        "payment_status": "processing",
        "payment_type": "one_time",
        "expires_at": "2026-03-13T15:21:12.988351Z",
        "max_uses": 1,
        "current_uses": 0,
        "is_active": true,
        "is_expired": false,
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

::: tip Response Variations
Payment links in the list may have different fields depending on how they were created:
- Links created with minimal data will only show core fields
- Links created with full details (cart, customer info) will include all those fields
:::

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
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
    "payment_url": "http://localhost:3000/payment_link?payment_id=fce13397-afb5-4093-84c0-b64178691dbd",
    "payment_status": "processing",
    "payment_type": "one_time",
    "expires_at": "2026-02-01T12:00:00Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "is_expired": true,
    "customer_id": "AB-001",
    "customer_name": "John Doe",
    "customer_email": "john@example.com",
    "product_name": "Course A",
    "product_description": "Art Course for Beginners",
    "cart": {
      "items": [
        {
          "name": "Course A",
          "price": 100.5,
          "quantity": 1
        }
      ],
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
    "payment_url": "http://localhost:3000/payment_link?payment_id=f7a9ff0a-678f-45ba-a918-dcafc5d479e9",
    "payment_status": "processing",
    "payment_type": "one_time",
    "expires_at": "2026-03-13T15:21:12.988351Z",
    "max_uses": 1,
    "current_uses": 0,
    "is_active": true,
    "is_expired": false,
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
| `payment_url` | string | URL for customers to complete payment |
| `payment_status` | string | Status: `processing`, `completed`, `expired`, `cancelled` |
| `payment_type` | string | Payment type: `one_time`, `recurring` |
| `expires_at` | timestamp | Expiration timestamp |
| `max_uses` | integer | Maximum number of uses allowed |
| `current_uses` | integer | Current number of uses |
| `is_active` | boolean | Whether the payment link is active |
| `is_expired` | boolean | Whether the payment link has expired |
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

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid payment link ID format |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Payment link not found |
| 500 | Internal Server Error | Server error |

---

### 5. Update Payment Link Status

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
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

### Signing Process

1. **Construct message:**
   ```
   message = METHOD + PATH + TIMESTAMP + BODY
   ```

2. **Sign with DSA:**
   - Hash using SHA-256
   - Sign using DSA with DER encoding
   - Encode as Base64

3. **Include in request headers**

For detailed implementation examples in various languages, see the [Merchant API Authentication Guide](/api-reference/authentication).

---

## Rate Limiting

- **Create Payment Link:** 10 requests per minute per API key
- **List Payment Links:** 30 requests per minute per API key
- **Get Payment Link:** 30 requests per minute per API key
- **Update Status:** 10 requests per minute per API key

---

## Common Use Cases

### Get Available Currencies

Before creating a payment link, fetch the list of supported currencies:

```bash
curl https://api.bitxpay.com/api/v1/currencies \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Accept: application/json"
```

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
    "currency": "USDT"
  }'
```

### Create Payment Link with Full Details

```bash
curl -X POST https://api.bitxpay.com/payment_links \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
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
curl https://api.bitxpay.com/payment_links?status=pending&currency=USDT&limit=10 \
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
