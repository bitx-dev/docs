---
title: Merchant API - Subscriptions
description: Create and manage crypto subscription links for recurring cryptocurrency payments with the BITXpay Merchant API.
---

# Merchant API - Subscriptions

## Overview

The Subscriptions API lets you create on-chain recurring billing plans, enroll subscribers, and manage subscription links, payments, and invitations for **recurring cryptocurrency payments**. Billing terms (amount, interval, trial period, grace period) are anchored on-chain via a signed plan digest; a subscription link represents an individual subscriber's enrollment and on-chain approval to be billed.

**Base URL:** `{{ $api.sandbox.baseUrl }}`

The API is split into two route groups with different authentication requirements:

| Group | Path Prefixes | Authentication |
|-------|---------------|-----------------|
| **Authenticated (Merchant) Routes** | `/subscriptions/plans`, `/subscriber`, `/invitations`, `/subscriptions/link` | Merchant API Key + Ed25519 (EdDSA) signature — same scheme as the [Payments API](/api-reference/payments) |
| **Public Routes** | `/public/subscriptions/plans`, `/public/subscriber`, `/public/subscriptions/link`, `/public/subscriptions/nft` | No merchant signature — called directly from the customer-facing wallet/checkout flow |

---

## Plan Billing Models

When creating a subscription plan, choose one of two billing models:

- **PlanByAmount** — fixed billing in a specific token: provide `token` + `amount`
- **PlanByValue** — fixed billing denominated in a currency: provide `currency` + `value`

Provide one pair or the other, not both, in the [Create Subscription Plan](#1-create-subscription-plan) request. The `kind` field (`SubscriptionPlanType`) further classifies the plan.

---

## Subscription Plan Statuses

| Status | Description |
|--------|-------------|
| `active` | Plan is live and can accept new subscribers |
| `deprecated` | Plan no longer accepts new subscribers (existing subscribers unaffected) |

## Subscriber Statuses

| Status | Description |
|--------|-------------|
| `invitation_sent` | Subscriber created, awaiting on-chain confirmation |
| `active` | Subscriber is actively being billed |
| `inactive` | Subscriber is not currently active |
| `suspended` | Subscriber billing suspended |
| `cancelled` | Subscription cancelled |

This is the canonical subscriber status set referenced by every subscriber endpoint on this page.

## Billing Intervals

Plans store `interval`, `trial_period`, `grace_period` (`max_arrears`), `auto_cancel_after_missed`, and `subscribe_deadline` as raw **seconds** on-chain. Common interval values:

| Name | Seconds |
|------|---------|
| Daily | 86400 |
| Weekly | 604800 |
| Monthly | 2592000 |
| Quarterly | 7776000 |
| Yearly | 31536000 |

---

## Authenticated (Merchant) Routes

All endpoints in this section require Merchant API Key authentication with an Ed25519 (EdDSA) request signature (RSA-PSS accepted for legacy keys):

```
X-API-Key: btxm_test_xxxxxxxxxxxx
X-API-Signature: <base64_encoded_ed25519_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

### Subscription Plans — `/subscriptions/plans`

#### 1. Create Subscription Plan

**POST** `/subscriptions/plans/`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `network_id` | string (UUID) | No | Blockchain network ID |
| `currency_id` | string (UUID) | No | Currency ID |
| `merchant` | string | Yes | Merchant on-chain address |
| `destination` | string | Yes | Destination address for collected funds |
| `token` | string | Conditional | Token contract address (required with `amount` for **PlanByAmount**) |
| `amount` | string | Conditional | Billing amount, raw units (required with `token`) |
| `currency` | string | Conditional | Currency code (required with `value` for **PlanByValue**) |
| `value` | string | Conditional | Billing value in `currency` (required with `currency`) |
| `period` | integer | No | Billing period (seconds) |
| `interval` | integer | No | Billing interval (seconds) |
| `trial_period` | integer | No | Trial period (seconds) |
| `max_arrears` | integer | No | Grace period before a missed payment counts as arrears (seconds) |
| `auto_cancel_after_missed` | integer | No | Number of missed payments before auto-cancellation |
| `subscribe_deadline` | integer | No | Deadline for the subscriber to complete on-chain enrollment (seconds) |
| `plan_nonce` | integer | No | On-chain plan nonce |
| `merchant_sig` | string | Yes | Merchant's on-chain signature over the plan digest |
| `metadata_uri` | string | No | URI to off-chain plan metadata |
| `name` | string | Yes | Plan name |
| `description` | string | No | Plan description |
| `kind` | string (`SubscriptionPlanType`) | No | Plan type classification |

> Provide either `token` + `amount` (**PlanByAmount**) or `currency` + `value` (**PlanByValue**) — not both.

**Response (`SubscriptionPlanResponse`):**

```json
{
  "id": "uuid",
  "merchant_id": "uuid",
  "network_id": "uuid",
  "chain_id": 0,
  "network": { "id": "uuid", "name": "string", "chain_id": 0, "symbol": "string", "is_active": true, "created_at": "", "updated_at": "" },
  "merchant_address": "string",
  "destination_address": "string",
  "token": "string",
  "currency_id": "uuid",
  "currency": "string",
  "currency_symbol": "string",
  "amount": "string",
  "formatted_amount": "string",
  "interval": 0,
  "trial_period": 0,
  "max_arrears": 0,
  "auto_cancel_after_missed": 0,
  "subscribe_deadline": 0,
  "plan_nonce": 0,
  "plan_id": "string",
  "digest": "string",
  "revoked": false,
  "source": "string",
  "metadata_uri": "string",
  "name": "string",
  "description": "string",
  "is_deprecated": false,
  "deprecated_at": "",
  "status": "active",
  "total_subscribers": 0,
  "active_subscribers": 0,
  "trial_subscribers": 0,
  "failed_subscribers": 0,
  "subscribers": [],
  "created_at": "",
  "updated_at": ""
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload, or both/neither of `token`+`amount` / `currency`+`value` provided |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 500 | Internal Server Error | Server error |

---

#### 2. List Subscription Plans

**GET** `/subscriptions/plans/`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `page_size` | integer | Results per page |
| `search` | string | Search by plan name |
| `deprecated` | boolean | Filter by deprecated status |
| `start_date` | datetime | Filter by creation date range start |
| `end_date` | datetime | Filter by creation date range end |

**Response (`SubscriptionPlanListResponse`):**

```json
{
  "plans": [ { "...": "SubscriptionPlanResponse, see #1" } ],
  "total": 0,
  "page": 0,
  "page_size": 0,
  "total_pages": 0
}
```

---

#### 3. Get Subscription Plan

**GET** `/subscriptions/plans/:id`

**Path Parameters:** `id` (UUID)

**Response:** `SubscriptionPlanResponse` (same shape as [#1](#1-create-subscription-plan))

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Plan not found |
| 500 | Internal Server Error | Server error |

---

#### 4. Update Subscription Plan

**PUT** `/subscriptions/plans/:id`

**Path Parameters:** `id` (UUID)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updated plan name |
| `metadata_uri` | string | No | Updated metadata URI |
| `status` | string (`SubscriptionPlanStatus`) | No | `active` or `deprecated` |

**Response:** `SubscriptionPlanResponse` (same shape as [#1](#1-create-subscription-plan))

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Plan not found |
| 500 | Internal Server Error | Server error |

---

#### 5. Deprecate Subscription Plan

**DELETE** `/subscriptions/plans/:id`

**Path Parameters:** `id` (UUID)

**Request Body:** none

**Response:** Success message confirming the plan was deprecated.

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Plan not found |
| 500 | Internal Server Error | Server error |

---

### Subscribers — `/subscriber`

#### 6. Create Subscriber

**POST** `/subscriber/`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subscription_plan_id` | string (UUID) | Yes | Plan to subscribe to |
| `customer_id` | string | No | Your internal customer identifier |
| `customer_name` | string | No | Customer's full name |
| `customer_email` | string | No | Customer's email address |
| `webhook_metadata` | object | No | Custom metadata passed to webhooks |
| `failure_return_url` | string | No | URL to redirect to on failed enrollment |
| `success_return_url` | string | No | URL to redirect to on successful enrollment |

**Response (`SubscriberResponse`):**

```json
{
  "id": "uuid",
  "subscription_plan_id": "uuid",
  "merchant_user_id": "uuid",
  "customer_id": "string",
  "customer_name": "string",
  "customer_email": "string",
  "subscription_link_url": "string",
  "status": "invitation_sent",
  "subscription_plan": { "...": "SubscriptionPlan model" },
  "subscription_link": { "...": "SubscriptionLink model" },
  "webhook_metadata": {},
  "created_at": "",
  "updated_at": ""
}
```

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload or missing required fields |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscription plan ID not found |
| 500 | Internal Server Error | Server error |

---

#### 7. Get Subscribers By Merchant

**GET** `/subscriber/`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `plan_id` | string (UUID) | Filter by subscription plan |
| `search` | string | Search by customer name/email |
| `start_date` | datetime | Filter by creation date range start |
| `end_date` | datetime | Filter by creation date range end |
| `page` | integer | Page number (default 1) |
| `page_size` | integer | Results per page (default 10) |

**Response (`SubscriberListResponse`):**

```json
{
  "subscribers": [ { "...": "SubscriberResponse, see #6" } ],
  "data": [ { "...": "Subscriber model" } ],
  "total": 0,
  "page": 0,
  "page_size": 0,
  "total_pages": 0
}
```

---

#### 8. Get Subscribers By Plan ID

**GET** `/subscriber/plan/:plan_id`

**Path Parameters:** `plan_id` (UUID)

**Response:** `SubscriberListResponse` (same shape as [#7](#7-get-subscribers-by-merchant))

---

#### 9. Update Subscriber

**PUT** `/subscriber/:id`

**Path Parameters:** `id` (UUID)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customer_name` | string | No | Updated customer name |
| `customer_email` | string | No | Updated customer email |
| `status` | string (`SubscriberStatus`) | No | New subscriber status |

**Response:** `SubscriberResponse` (same shape as [#6](#6-create-subscriber))

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscriber not found |
| 500 | Internal Server Error | Server error |

---

#### 10. Get Subscriber By ID

**GET** `/subscriber/:id`

**Path Parameters:** `id` (UUID)

**Response:** `SubscriberResponse` (same shape as [#6](#6-create-subscriber))

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscriber not found |
| 500 | Internal Server Error | Server error |

---

### Invitations — `/invitations`

#### 11. Get Invitations By Plan ID

**GET** `/invitations/`

**Query Parameters:** `plan_id` (string, UUID)

**Response (`InvitationListResponse`):**

```json
{
  "invitations": [ { "...": "SubscriberResponse, see #6" } ],
  "data": [ { "...": "Subscriber model" } ],
  "total": 0,
  "page": 0,
  "page_size": 0,
  "total_pages": 0
}
```

---

### Subscription Links — `/subscriptions/link`

#### 12. List Subscription Links

**GET** `/subscriptions/link/`

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | integer | Page number |
| `page_size` | integer | Results per page |
| `search` | string | Search term |
| `is_active` | boolean | Filter by active status |
| `plan_id` | string (UUID) | Filter by subscription plan |
| `start_date` | datetime | Filter by creation date range start |
| `end_date` | datetime | Filter by creation date range end |

**Response (`SubscriptionLinkListResponse`):**

```json
{
  "links": [ { "...": "SubscriptionLinkResponse, see #13" } ],
  "total": 0,
  "page": 0,
  "page_size": 0,
  "total_pages": 0
}
```

---

#### 13. Get Subscription Link

**GET** `/subscriptions/link/:id`

**Path Parameters:** `id` (UUID)

**Response (`SubscriptionLinkResponse`):**

```json
{
  "id": "uuid",
  "merchant_user_id": "uuid",
  "subscription_plan_id": "uuid",
  "subscribed_at": "",
  "trial_ends_at": "",
  "wallet_address": "string",
  "subscribe_hash": "string",
  "approvals": [ { "...": "ApprovalDetail" } ],
  "owed": "string",
  "paid_periods": 0,
  "locked": false,
  "customer_id": "string",
  "customer_email": "string",
  "customer_name": "string",
  "expires_at": "",
  "is_active": true,
  "subscription_transactions": [ { "...": "SubscriptionResponse, see #21" } ],
  "plan": { "...": "SubscriptionPlanSummary" },
  "created_at": "",
  "updated_at": ""
}
```

---

## Public Routes

The endpoints in this section are called directly from the customer-facing wallet/checkout flow and do **not** require `X-API-Key`/`X-API-Signature` headers. [Record Subscription Payment](#21-record-subscription-payment) instead identifies the merchant via a `merchant_key` field in the request body.

### Subscription Plans — `/public/subscriptions/plans`

#### 14. List Public Subscription Plans

**GET** `/public/subscriptions/plans/`

**Response:** `SubscriptionPlanListResponse` (same shape as [#2](#2-list-subscription-plans))

---

#### 15. Get Public Subscription Plan

**GET** `/public/subscriptions/plans/:id`

**Path Parameters:** `id` (UUID)

**Response:** `SubscriptionPlanResponse` (same shape as [#1](#1-create-subscription-plan))

---

### Subscribers — `/public/subscriber`

#### 16. Prepare Subscription

**GET** `/public/subscriber/prepare`

Returns the on-chain parameters (plan digest, approval details, etc.) a customer's wallet needs to sign in order to complete enrollment for a given subscription plan.

---

#### 17. Get Subscriber By ID

**GET** `/public/subscriber/:id`

**Path Parameters:** `id` (UUID)

**Response:** `SubscriberResponse` (same shape as [#6](#6-create-subscriber))

---

#### 18. Update Subscriber

**PUT** `/public/subscriber/:id`

**Path Parameters:** `id` (UUID)

**Request Body:** `UpdateSubscriberRequest` (same shape as [#9](#9-update-subscriber))

**Response:** `SubscriberResponse` (same shape as [#6](#6-create-subscriber))

---

### Subscription Links — `/public/subscriptions/link`

#### 19. Create Subscription Link

**POST** `/public/subscriptions/link/`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subscription_plan_id` | string (UUID) | Yes | Plan being subscribed to |
| `subscriber_id` | string (UUID) | No | Associated subscriber ID |
| `subscription_onchain_id` | integer | No | On-chain subscription ID |
| `subscribed_at` | timestamp | No | Subscription start time |
| `trial_ends_at` | timestamp | No | Trial end time |
| `wallet_address` | string | Yes | Customer's wallet address |
| `subscribe_hash` | string | Yes | On-chain subscription transaction hash |
| `owed` | string | No | Amount currently owed |
| `paid_periods` | integer | No | Number of billing periods paid |
| `locked` | boolean | No | Whether the link is locked from further updates |
| `approvals` | array | Yes | On-chain token approval details (at least 1 required) |
| `customer_id` | string | No | Your internal customer identifier |
| `customer_email` | string | No | Customer's email address |
| `customer_name` | string | No | Customer's full name |
| `expires_at` | timestamp | No | Link expiration time |

**`approvals[]` fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `approval_hash` | string | No | On-chain approval transaction hash |
| `token_address` | string | Yes | Approved token contract address |
| `amount_approved` | string | Yes | Approved amount (raw units) |
| `network_name` | string | Yes | Blockchain network name |
| `chain_id` | integer | No | Chain ID |
| `decimals` | integer | No | Token decimals |

**Response:** `SubscriptionLinkResponse` (same shape as [#13](#13-get-subscription-link))

---

#### 20. Get Subscription Links By Wallet

**GET** `/public/subscriptions/link/:walletAddress`

**Path Parameters:** `walletAddress` (string)

**Response:** `SubscriptionLinkListResponse` (same shape as [#12](#12-list-subscription-links))

---

#### 21. Record Subscription Payment

**POST** `/public/subscriptions/link/payment`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sub_link_id` | string (UUID) | Yes | Subscription link ID |
| `merchant_key` | string | Yes | Merchant identifier used to authenticate this request |
| `tx_hash` | string | Yes | Blockchain transaction hash |
| `block_number` | integer | No | Block number the transaction was included in |
| `block_hash` | string | No | Block hash |
| `network_id` | string (UUID) | Yes | Blockchain network ID |
| `currency_id` | string (UUID) | Yes | Currency ID |
| `amount_paid` | string | Yes | Amount paid |
| `wallet_used` | string | Yes | Wallet address the payment was made from |

**Response (`SubscriptionResponse`):**

```json
{
  "id": "uuid",
  "merchant_id": "uuid",
  "sub_link_id": "uuid",
  "tx_hash": "string",
  "block_number": 0,
  "block_hash": "string",
  "confirmations": 0,
  "currency_id": "uuid",
  "network_id": "uuid",
  "amount": "string",
  "user_wallet_address": "string",
  "paid_at": "",
  "status": "string",
  "starts_at": "",
  "ends_at": "",
  "next_billing_at": "",
  "plan": { "...": "SubscriptionLinkResponse, see #13" },
  "created_at": "",
  "updated_at": ""
}
```

---

#### 22. Update Subscription Link

**PUT** `/public/subscriptions/link/:id`

**Path Parameters:** `id` (UUID)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trial_ends_at` | timestamp | No | Updated trial end time |
| `customer_email` | string | No | Updated customer email |
| `customer_name` | string | No | Updated customer name |
| `expires_at` | timestamp | No | Updated expiration time |
| `is_active` | boolean | No | Updated active status |
| `locked` | boolean | No | Updated locked status |
| `owed` | string | No | Updated amount owed |

**Response:** `SubscriptionLinkResponse` (same shape as [#13](#13-get-subscription-link))

---

### NFT Metadata — `/public/subscriptions/nft`

#### 23. Get Subscription NFT Metadata

**GET** `/public/subscriptions/nft/:plan_id`

**Path Parameters:** `plan_id` (UUID)

**Response (`SubscriptionMetaResponse`):**

```json
{
  "name": "string",
  "description": "string",
  "image": "string",
  "external_url": "string",
  "attributes": [
    { "trait_type": "string", "value": "string" }
  ]
}
```

---

## Rate Limiting

Rate limits are applied per route based on the configured rate limiter (payment-related routes use a stricter limiter than read/default routes). Contact your account team for the current per-route limits applicable to your account.

---

## Common Use Cases

### Create a Subscription Plan

```bash
curl -X POST {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscriptionPlans }}/ \
  -H "X-API-Key: btxm_test_xxxxxxxxxxxx" \
  -H "X-API-Signature: <base64_encoded_ed25519_signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3",
    "destination": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3",
    "token": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    "amount": "100000",
    "interval": 2592000,
    "merchant_sig": "<merchant_onchain_signature>",
    "name": "Pro Plan Monthly"
  }'
```

### Create a Subscriber

```bash
curl -X POST {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscribers }}/ \
  -H "X-API-Key: btxm_test_xxxxxxxxxxxx" \
  -H "X-API-Signature: <base64_encoded_ed25519_signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
    "customer_id": "cust-001",
    "customer_email": "customer@example.com",
    "customer_name": "John Doe"
  }'
```

### Create a Subscription Link (Public)

```bash
curl -X POST {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscriptions }}/ \
  -H "Content-Type: application/json" \
  -d '{
    "subscription_plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
    "wallet_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3",
    "subscribe_hash": "0xa1b2c3d4e5f60789a1b2c3d4e5f60789a1b2c3d4e5f60789a1b2c3d4e5f60781",
    "approvals": [
      {
        "token_address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
        "amount_approved": "100000",
        "network_name": "arbitrum",
        "chain_id": 42161,
        "decimals": 6
      }
    ]
  }'
```

### Record a Subscription Payment (Public)

```bash
curl -X POST {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscriptions }}/payment \
  -H "Content-Type: application/json" \
  -d '{
    "sub_link_id": "5d17b0c4-b32c-40dd-a2e2-8ace612251c7",
    "merchant_key": "btxm_test_xxxxxxxxxxxx",
    "tx_hash": "0xa1b2c3d4e5f60789a1b2c3d4e5f60789a1b2c3d4e5f60789a1b2c3d4e5f60785",
    "network_id": "0b4f3bab-4354-4373-9821-c8665fffbca3",
    "currency_id": "d4e5f6a7-8b9c-4d1e-9f2a-3b4c5d6e7f80",
    "amount_paid": "49.99",
    "wallet_used": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3"
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
