---
title: Merchant API - Subscriptions
description: Create and manage crypto subscription links for recurring cryptocurrency payments with the BITXpay Merchant API.
---

# Merchant API - Subscriptions

## Overview

The Merchant API Subscriptions endpoints allow you to create, manage, and retrieve subscription links for accepting **recurring cryptocurrency payments**. Unlike traditional payment links (one-time), subscriptions enable automatic billing on a recurring basis - daily, weekly, monthly, quarterly - entirely on-chain and in crypto.

**Base URL:** `https://api.bitxpay.com/subscriptions`

**Authentication:** Merchant API Key (Asymmetric DSA)

---

## What are Crypto Subscriptions?

Crypto Subscriptions allow merchants to charge customers automatically on a recurring basis. Once a customer subscribes, BITXpay handles all billing automatically - no manual intervention needed from the merchant.

### How It Works

1. **Customer Subscribes** - Customer connects their wallet and provides consent for recurring payments
2. **BITXpay Pulls Payment** - At each billing interval, BITXpay automatically pulls the subscription amount from the customer's wallet
3. **Merchant Receives Funds** - Payments are automatically settled to the merchant's preferred currency (USDC by default in Q1)

::: tip Competitive Advantage
Crypto subscriptions eliminate the need for credit cards, bank accounts, or third-party billing providers like Stripe. This is a direct competitive differentiator versus BoomFi and NOWPayments.
:::

---

## Subscription Types

BITXpay supports four subscription types to match different business models:

| Type | Name | Description | Example |
|------|------|-------------|---------|
| **FAFT** | Fixed Amount, Fixed Term | Same amount, same billing period | $50/month, always |
| **VAFT** | Variable Amount, Fixed Term | Usage-based billing, fixed period | Metered billing monthly |
| **VAOT** | Variable Amount, Open-Ended | Pay-as-you-go, no end date | No commitment billing |
| **Invoiced** | On-Demand Invoicing | Merchant sends invoice, customer pays | Manual billing cycle |

---

## Supported Cryptocurrencies

Subscriptions support the same cryptocurrencies as payment links:

| Currency Code | Name | Networks Available |
|--------------|------|-------------------|
| **USDC** | USD Coin | 7 networks |
| **USDT** | Tether USD | 7 networks |
| **ETH** | Ethereum | 5 networks |
| **BNB** | BNB | 3 networks |
| **AVAX** | Avalanche | 2 networks |
| **LINK** | ChainLink | 6 networks |
| **WBTC** | Wrapped BTC | 5 networks |
| **WETH** | Wrapped Ethereum | 6 networks |

---

## Subscription Lifecycle

### Subscription Link Statuses

| Status | Description |
|--------|-------------|
| `active` | Subscription is active and billing will occur |
| `paused` | Subscription temporarily suspended |
| `cancelled` | Subscription terminated by customer or merchant |
| `expired` | Subscription reached its end date |
| `pending` | Subscription created but not yet confirmed |

### Billing Intervals

- `daily` - Billed every day
- `weekly` - Billed every 7 days
- `monthly` - Billed every 30 days
- `quarterly` - Billed every 90 days
- `yearly` - Billed every 365 days

---

## Public Endpoints

### 1. Create Subscription Link

Create a new subscription link that customers can use to subscribe to recurring payments.

#### Request

**POST** `/public/subscriptions/link/`

#### Authentication

```
X-API-Key: btxm_live_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `plan_id` | string | Yes | Subscription plan ID | "plan_abc123" |
| `wallet_address` | string | Yes | Customer's wallet address | "0x1234..." |
| `customer_email` | string | No | Customer email for notifications | "customer@example.com" |
| `metadata` | object | No | Custom metadata for the subscription | `{"source": "website"}` |

#### Request Example

```json
{
  "plan_id": "plan_abc123",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "customer_email": "customer@example.com",
  "metadata": {
    "source": "website",
    "utm_campaign": "summer_sale"
  }
}
```

#### Response (201 Created)

```json
{
  "id": "sub_1234567890",
  "plan_id": "plan_abc123",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "status": "pending",
  "created_at": "2026-01-31T12:00:00Z",
  "updated_at": "2026-01-31T12:00:00Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique subscription link identifier |
| `plan_id` | string | Reference to the subscription plan |
| `wallet_address` | string | Customer's wallet address |
| `status` | string | Subscription status: `pending`, `active`, `paused`, `cancelled`, `expired` |
| `created_at` | timestamp | Creation timestamp (ISO 8601) |
| `updated_at` | timestamp | Last update timestamp (ISO 8601) |

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload or missing required fields |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Plan ID not found |
| 409 | Conflict | Duplicate subscription link or wallet already subscribed |
| 500 | Internal Server Error | Server error |

---

### 2. Get Subscription Links by Wallet Address

Retrieve all subscription links associated with a specific wallet address.

#### Request

**GET** `/public/subscriptions/link/{walletAddress}`

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `walletAddress` | string | User's wallet address | "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" |

#### Authentication

```
X-API-Key: btxm_live_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Accept: application/json
```

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "sub_1234567890",
      "plan_id": "plan_abc123",
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "status": "active",
      "created_at": "2026-01-31T12:00:00Z",
      "updated_at": "2026-02-15T10:30:00Z"
    },
    {
      "id": "sub_0987654321",
      "plan_id": "plan_xyz789",
      "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
      "status": "cancelled",
      "created_at": "2026-01-15T08:00:00Z",
      "updated_at": "2026-01-20T14:00:00Z"
    }
  ],
  "total": 2
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of subscription link objects |
| `data[].id` | string | Subscription link ID |
| `data[].plan_id` | string | Subscription plan ID |
| `data[].wallet_address` | string | Wallet address |
| `data[].status` | string | Current status |
| `data[].created_at` | timestamp | Creation timestamp |
| `data[].updated_at` | timestamp | Last update timestamp |
| `total` | integer | Total number of subscription links |

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid wallet address format |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 500 | Internal Server Error | Server error |

---

### 3. Record Subscription Payment

Record a payment that has been made for a subscription link. This endpoint is typically called after confirming an on-chain transaction.

#### Request

**POST** `/public/subscriptions/link/payment`

#### Authentication

```
X-API-Key: btxm_live_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `subscription_link_id` | string | Yes | Subscription link ID | "sub_1234567890" |
| `tx_hash` | string | Yes | Blockchain transaction hash | "0xabc123..." |
| `amount` | string | Yes | Amount paid | "50.00" |
| `paid_at` | timestamp | Yes | Payment timestamp (ISO 8601) | "2026-02-01T12:00:00Z" |

#### Request Example

```json
{
  "subscription_link_id": "sub_1234567890",
  "tx_hash": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbD1234567890abcdef",
  "amount": "50.00",
  "paid_at": "2026-02-01T12:00:00Z"
}
```

#### Response (200 OK)

```json
{
  "message": "Payment recorded successfully"
}
```

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscription link not found |
| 409 | Conflict | Transaction hash already recorded |
| 500 | Internal Server Error | Server error |

---

### 4. Update Subscription Link

Update the status or metadata of an existing subscription link.

#### Request

**PUT** `/public/subscriptions/link/{id}`

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Subscription Link ID | "sub_1234567890" |

#### Authentication

```
X-API-Key: btxm_live_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description | Valid Values |
|-------|------|----------|-------------|--------------|
| `status` | string | No | New subscription status | `active`, `paused`, `cancelled` |
| `metadata` | object | No | Updated metadata | Any valid JSON object |

#### Request Examples

**Pause Subscription:**
```json
{
  "status": "paused"
}
```

**Update Metadata:**
```json
{
  "metadata": {
    "source": "website",
    "plan_tier": "premium"
  }
}
```

**Cancel Subscription:**
```json
{
  "status": "cancelled"
}
```

#### Response (200 OK)

```json
{
  "id": "sub_1234567890",
  "plan_id": "plan_abc123",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "status": "paused",
  "updated_at": "2026-02-15T14:30:00Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Subscription link ID |
| `plan_id` | string | Subscription plan ID |
| `wallet_address` | string | Customer's wallet address |
| `status` | string | Updated status |
| `updated_at` | timestamp | Last update timestamp |

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload or status value |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscription link not found |
| 500 | Internal Server Error | Server error |

---

## Subscriber Endpoints

### 5. Get Public Subscriber by ID

Retrieve subscriber information by their unique ID.

#### Request

**GET** `/public/subscriber/{id}`

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Subscriber ID (UUID) | "550e8400-e29b-41d4-a716-446655440000" |

#### Authentication

```
X-API-Key: btxm_live_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Accept: application/json
```

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "status": "active",
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-02-01T12:00:00Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique subscriber identifier |
| `name` | string | Subscriber name |
| `email` | string | Subscriber email address |
| `wallet_address` | string | Subscriber's wallet address |
| `status` | string | Subscriber status: `active`, `inactive`, `suspended` |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid subscriber ID format |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscriber not found |
| 500 | Internal Server Error | Server error |

---

### 6. Update Subscriber (Public)

Update subscriber information such as name, email, phone, or metadata.

#### Request

**PUT** `/public/subscriber/{id}`

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `id` | string | Subscriber ID (UUID) | "550e8400-e29b-41d4-a716-446655440000" |

#### Authentication

```
X-API-Key: btxm_live_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_dsa_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

#### Request Body

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `name` | string | No | Subscriber name | "John Doe" |
| `email` | string | No | Subscriber email | "john@example.com" |
| `phone` | string | No | Subscriber phone number | "+1-555-0123" |
| `metadata` | object | No | Custom metadata | `{"company": "Acme Inc"}` |

#### Request Example

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "+1-555-0123",
  "metadata": {
    "company": "Acme Inc",
    "tier": "premium"
  }
}
```

#### Response (200 OK)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john.doe@example.com",
  "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "status": "active",
  "updated_at": "2026-02-15T14:30:00Z"
}
```

**Response Fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique subscriber identifier |
| `name` | string | Updated subscriber name |
| `email` | string | Updated email address |
| `wallet_address` | string | Subscriber's wallet address |
| `status` | string | Current subscriber status |
| `updated_at` | timestamp | Last update timestamp |

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscriber not found |
| 409 | Conflict | Email already in use |
| 500 | Internal Server Error | Server error |

---

## Authentication

All subscription API requests require the following headers:

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

## Product Roadmap

### Q1: MVP (Current)
- Simple subscription links with automated billing
- USDC settlement
- Single currency per subscription

### Q2: Enhanced Subscriptions
- Multiple currency support
- Backup wallets for failed payments
- Customer portal for self-management
- Email notifications for billing events

### Q3: Enterprise Features
- Multiple backup wallets per subscription
- Multiple currencies per subscription
- Advanced analytics and reporting
- Webhook enhancements

---

## Rate Limiting

- **Create Subscription Link:** 10 requests per minute per API key
- **Get Subscription Links:** 30 requests per minute per API key
- **Record Payment:** 30 requests per minute per API key
- **Update Subscription Link:** 10 requests per minute per API key
- **Get/Update Subscriber:** 30 requests per minute per API key

---

## Common Use Cases

### Create a Monthly Subscription

```bash
curl -X POST https://api.bitxpay.com/public/subscriptions/link/ \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{
    "plan_id": "plan_monthly_premium",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
    "customer_email": "customer@example.com",
    "metadata": {
      "source": "checkout_page"
    }
  }'
```

### Get All Subscriptions for a Wallet

```bash
curl https://api.bitxpay.com/public/subscriptions/link/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z"
```

### Record a Subscription Payment

```bash
curl -X POST https://api.bitxpay.com/public/subscriptions/link/payment \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_link_id": "sub_1234567890",
    "tx_hash": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbD1234567890abcdef",
    "amount": "49.99",
    "paid_at": "2026-02-01T00:00:00Z"
  }'
```

### Pause a Subscription

```bash
curl -X PUT https://api.bitxpay.com/public/subscriptions/link/sub_1234567890 \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{"status": "paused"}'
```

### Update Subscriber Information

```bash
curl -X PUT https://api.bitxpay.com/public/subscriber/550e8400-e29b-41d4-a716-446655440000 \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1-555-0123"
  }'
```

---

## Webhooks

Subscription events can be delivered via webhooks. Configure your webhook URL in the dashboard to receive:

- `subscription.created` - New subscription link created
- `subscription.activated` - Subscription activated
- `subscription.paused` - Subscription paused
- `subscription.cancelled` - Subscription cancelled
- `subscription.payment.success` - Payment successful
- `subscription.payment.failed` - Payment failed
- `subscription.expiring` - Subscription nearing expiration

See the [Webhooks Guide](/get-started/webhooks) for detailed payload structures.

---

## Support

For questions or issues:

- **Documentation:** https://docs.bitxpay.com
- **Email:** support@bitxpay.com
- **API Status:** https://status.bitxpay.com
