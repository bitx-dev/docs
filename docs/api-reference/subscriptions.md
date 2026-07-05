---
title: Merchant API - Subscriptions
description: Create and manage crypto subscription links for recurring cryptocurrency payments with the BITXpay Merchant API.
---

# Merchant API - Subscriptions

## Overview

The Merchant API Subscriptions endpoints allow you to create, manage, and retrieve subscription links for accepting **recurring cryptocurrency payments**. Unlike traditional payment links (one-time), subscriptions enable automatic billing on a recurring basis - daily, weekly, monthly, quarterly - entirely on-chain and in crypto.

**Base URL:** `{{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscriptions }}`

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

### 1. Create Subscriber & Subscription Link

Create a new subscriber and generate a subscription link they can use to complete the payment setup.

#### Request

**POST** `/subscriptions/subscribers/createlink`

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
| `subscription_plan_id` | string | Yes | ID of the subscription plan to subscribe to | "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c" |
| `customer_id` | string | Yes | Your internal customer identifier | "cust-001" |
| `customer_email` | string | Yes | Customer's email address | "customer@example.com" |
| `customer_name` | string | Yes | Customer's full name | "John Doe" |

#### Request Example

```json
{
  "subscription_plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
  "customer_id": "cust-001",
  "customer_email": "customer@example.com",
  "customer_name": "John Doe"
}
```

#### Response (200 OK)

```json
{
  "message": "Subscriber created successfully",
  "data": {
    "subscriber": {
      "id": "e42274f5-1fe9-4a7c-bac1-ebbbdd6cf9e4",
      "subscription_plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
      "merchant_user_id": "11111111-1111-1111-1111-111111111111",
      "customer_id": "cust-001",
      "customer_name": "John Doe",
      "customer_email": "customer@example.com",
      "Status": "invitation_sent",
      "WebhookMetadata": null,
      "created_at": "2026-07-05T08:12:45.328215578Z",
      "updated_at": "2026-07-05T08:12:45.328215578Z"
    },
    "subscription_link": "sandboxpay.bitxpay.com/subscriptions/subscription_link?subscription_id=e42274f5-1fe9-4a7c-bac1-ebbbdd6cf9e4"
  }
}
```

**Response Fields (`data.subscriber`):**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique subscriber identifier |
| `subscription_plan_id` | string (UUID) | The plan the subscriber is enrolled in |
| `merchant_user_id` | string (UUID) | The merchant account ID |
| `customer_id` | string | Your internal customer identifier |
| `customer_name` | string | Customer's full name |
| `customer_email` | string | Customer's email address |
| `Status` | string | Subscriber status: `invitation_sent`, `active`, `cancelled` |
| `WebhookMetadata` | object\|null | Custom metadata passed to webhooks |
| `created_at` | timestamp | Creation timestamp (ISO 8601) |
| `updated_at` | timestamp | Last update timestamp (ISO 8601) |

**Top-level response fields (alongside `data`):**

| Field | Type | Description |
|-------|------|-------------|
| `message` | string | Human-readable result message |
| `data.subscription_link` | string | URL the customer visits to complete subscription setup |

#### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload or missing required fields |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscription plan ID not found |
| 409 | Conflict | Subscriber already exists for this plan |
| 500 | Internal Server Error | Server error |

---

::: warning Endpoints Under Verification
The following endpoints (3–6) have not yet been verified against the live API. Paths and request/response schemas may differ from the actual implementation. Confirm from Postman before integrating.
:::

### 2. Get Subscriptions by Wallet Address

Retrieve all active and historical subscription links associated with a specific wallet address. This is a **public endpoint** — no API key or signature required.

#### Request

**GET** `/public/subscriptions/link/{walletAddress}`

#### Path Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `walletAddress` | string | Customer's wallet address (checksummed) | "0x7487fAfCAc95dDB5E28417773023B56572dc97C2" |

#### Authentication

No authentication headers required. This is a public endpoint.

#### Response (200 OK)

```json
{
  "data": [
    {
      "id": "5d17b0c4-b32c-40dd-a2e2-8ace612251c7",
      "merchant_user_id": "11111111-1111-1111-1111-111111111111",
      "subscription_plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
      "subscriber_id": "e42274f5-1fe9-4a7c-bac1-ebbbdd6cf9e4",
      "wallet_address": "0x7487fAfCAc95dDB5E28417773023B56572dc97C2",
      "subscribe_hash": "0x2b50b6e4d1b2300ad0a4f1c7b8efc8ffab208f456a61607e505eaec0253ab5de",
      "approval_hash": "0x6ed594bdd9a25b68339372be1dca2eafe2803f3ddb69556ada67508929433f4f",
      "amount_approved": "100000",
      "approved_contract": "0x4eb813Ecebc6923AF058F9F54ad7312D14d618d2",
      "subscription_onchain_id": 73,
      "status": "active",
      "failed_attempts": 0,
      "next_billing_at": "2026-07-05T08:23:51.413272Z",
      "next_retry_at": null,
      "is_active": true,
      "is_on_trial": false,
      "created_at": "2026-07-05T08:23:51.413551Z",
      "updated_at": "2026-07-05T08:23:51.413551Z",
      "subscription_plan": {
        "ID": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
        "MerchantID": "11111111-1111-1111-1111-111111111111",
        "PlanID": "67",
        "Version": "1",
        "NetworkID": "0b4f3bab-4354-4373-9821-c8665fffbca3",
        "CurrencyID": "a2222222-2222-2222-2222-222222222222",
        "Token": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
        "Amount": "100000",
        "FormattedAmount": "0.1",
        "Interval": 86400,
        "GracePeriod": 3600,
        "TrialPeriod": 0,
        "Name": "saadv5",
        "Description": "",
        "Status": "active",
        "CreatedAt": "2026-04-12T21:20:07.777541Z",
        "UpdatedAt": "2026-04-12T21:20:07.777541Z"
      }
    }
  ],
  "total": 2
}
```

**Response Fields (`data[]`):**

| Field | Type | Description |
|-------|------|-------------|
| `id` | string (UUID) | Unique subscription link ID |
| `merchant_user_id` | string (UUID) | Merchant account ID |
| `subscription_plan_id` | string (UUID) | Associated subscription plan ID |
| `subscriber_id` | string (UUID) | Subscriber record ID |
| `wallet_address` | string | Customer's wallet address |
| `subscribe_hash` | string | On-chain subscription transaction hash |
| `approval_hash` | string | On-chain token approval transaction hash |
| `amount_approved` | string | Token amount approved (raw, before decimals) |
| `approved_contract` | string | Smart contract address that received approval |
| `subscription_onchain_id` | integer | On-chain subscription ID |
| `status` | string | Status: `active`, `blocked`, `cancelled`, `expired` |
| `failed_attempts` | integer | Number of consecutive failed billing attempts |
| `last_payment_at` | timestamp | Timestamp of last successful payment (if any) |
| `last_payment_tx_hash` | string | Transaction hash of last payment (if any) |
| `next_billing_at` | timestamp | Scheduled next billing time |
| `next_retry_at` | timestamp\|null | Scheduled retry time after failure (if any) |
| `expires_at` | timestamp\|null | Subscription expiry time (if any) |
| `is_active` | boolean | Whether subscription is currently active |
| `is_on_trial` | boolean | Whether subscription is in trial period |
| `created_at` | timestamp | Creation timestamp |
| `updated_at` | timestamp | Last update timestamp |
| `subscription_plan` | object | Embedded plan details (see below) |

**`subscription_plan` object fields:**

| Field | Type | Description |
|-------|------|-------------|
| `ID` | string (UUID) | Plan ID |
| `MerchantID` | string (UUID) | Merchant account ID |
| `TxHash` | string | On-chain plan creation transaction hash |
| `PlanID` | string | On-chain numeric plan ID |
| `Version` | string | Plan version |
| `NetworkID` | string (UUID) | Blockchain network ID |
| `CurrencyID` | string (UUID) | Currency ID |
| `Token` | string | Token contract address |
| `Amount` | string | Billing amount (raw, before decimals) |
| `FormattedAmount` | string | Human-readable billing amount |
| `Interval` | integer | Billing interval in seconds (e.g. 86400 = daily) |
| `GracePeriod` | integer | Grace period in seconds after missed payment |
| `TrialPeriod` | integer | Trial period in seconds (0 = no trial) |
| `Name` | string | Plan name |
| `Description` | string | Plan description |
| `Status` | string | Plan status: `active`, `deprecated` |
| `CreatedAt` | timestamp | Plan creation timestamp |
| `UpdatedAt` | timestamp | Plan last updated timestamp |

**Top-level response fields:**

| Field | Type | Description |
|-------|------|-------------|
| `data` | array | Array of subscription link objects |
| `total` | integer | Total number of subscription links for this wallet |

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
curl -X POST {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscriptions }}/ \
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
curl {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscriptions }}/0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z"
```

### Record a Subscription Payment

```bash
curl -X POST {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscriptions }}/payment \
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
curl -X PUT {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscriptions }}/sub_1234567890 \
  -H "X-API-Key: btxm_live_xxxxxxxxxxxx" \
  -H "X-API-Signature: <signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{"status": "paused"}'
```

### Update Subscriber Information

```bash
curl -X PUT {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscribers }}/550e8400-e29b-41d4-a716-446655440000 \
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

- **Documentation:** {{ $site.urls.support.documentation }}
- **Email:** {{ $site.urls.support.email }}
- **API Status:** {{ $site.urls.support.statusPage }}
