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
| **Authenticated (Merchant) Routes** | `/merchant/subscription_plans`, `/merchant/subscribers`, `/merchant/subscribers/invitations`, `/merchant/subscription_links` | Merchant API Key + Ed25519 (EdDSA) signature — same scheme as the [Payments API](/api-reference/payments) |
| **Public Routes** | `/public/subscriptions/plans`, `/public/subscriber`, `/public/subscriptions/link`, `/public/subscriptions/nft` | No merchant signature — called directly from the customer-facing wallet/checkout flow |

---

## Plan Billing Models

The merchant create-plan service currently registers token-based plans using `token` and `amount` (a string in token base units). Although the shared request DTO also contains `currency`, `value`, `period`, `currency_id`, and `kind`, the merchant service does not use those fields to register a value-based plan. A request without `token` is rejected.

---

## Subscription Plan Statuses

| Status | Description |
|--------|-------------|
| `active` | Plan is live and can accept new subscribers |
| `inactive` | Plan is inactive |

Deprecation is represented separately by `is_deprecated` and `deprecated_at`. The Merchant API does not mount a DELETE/deprecate route.

## Subscriber Statuses

| Status | Description |
|--------|-------------|
| `invitation_sent` | Subscriber created, awaiting on-chain confirmation |
| `subscribed` | Subscriber accepted the invitation |
| `rejected` | Subscriber rejected the invitation |
| `expired` | Invitation expired |
| `cancelled` | Subscription cancelled |

This is the canonical subscriber status set referenced by every subscriber endpoint on this page.

## Billing Intervals

`interval` and `trial_period` are durations in **seconds**. `max_arrears` and `auto_cancel_after_missed` are counts, and `subscribe_deadline` is an integer enrollment deadline. Common interval values:

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
X-API-Key: btxm_9b451fa04a2e
X-API-Signature: <base64_encoded_ed25519_signature>
X-API-Timestamp: 2026-01-31T12:00:00Z
Content-Type: application/json
```

Success responses in this section wrap the documented response object in `{"message": "...", "data": ...}`. Creation returns HTTP `201`; reads and updates return `200`. Paths are relative to `/api/v1`; sign the full actual path, including any trailing slash.

### Subscription Plans — `/merchant/subscription_plans`

#### 1. Create Subscription Plan

**POST** `/merchant/subscription_plans/`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `network_id` | string (UUID) | No | Blockchain network ID |
| `currency_id` | string (UUID) | No | Present in the shared DTO; not persisted by the merchant create service |
| `merchant` | string | Yes | Merchant on-chain address |
| `destination` | string | Yes | Destination address for collected funds |
| `token` | string | Yes | Token contract address |
| `amount` | string | Yes | Billing amount in token base units |
| `currency` | string | No | Not used by the merchant create service |
| `value` | string | No | Not used by the merchant create service |
| `period` | integer | No | Present in the shared DTO; use `interval` for merchant plans |
| `interval` | integer | Yes | Billing interval (seconds) |
| `trial_period` | integer | No | Trial period (seconds) |
| `max_arrears` | integer | Yes | Maximum arrears count, 1–255 |
| `auto_cancel_after_missed` | integer | No | Number of missed payments before auto-cancellation |
| `subscribe_deadline` | integer | No | Deadline for the subscriber to complete on-chain enrollment (seconds) |
| `plan_nonce` | integer | Yes | Non-zero on-chain plan nonce; unique per merchant |
| `merchant_sig` | string | Yes | Merchant's on-chain signature over the plan digest |
| `metadata_uri` | string | No | URI to off-chain plan metadata |
| `name` | string | Yes | Plan name |
| `description` | string | No | Plan description |
| `kind` | string (`SubscriptionPlanType`) | No | Present in the shared DTO; not persisted by the merchant create service |

> Use `token` + `amount` for this merchant endpoint. Include the required signed plan fields even when a client SDK has older plan types.

**Response data (`SubscriptionPlanResponse`):** Optional fields such as `network`, `token`, `currency_id`, `plan_id`, `digest`, `source`, and `deprecated_at` are omitted when unavailable. The merchant service does not populate on-chain identifiers merely by registering the plan.


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
| 400 | Bad Request | Invalid request payload, missing token, or duplicate merchant plan nonce |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 500 | Internal Server Error | Server error |

---

#### 2. List Subscription Plans

**GET** `/merchant/subscription_plans/`

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

**GET** `/merchant/subscription_plans/:id`

**Path Parameters:** `id` (UUID)

**Response:** `SubscriptionPlanResponse` (same shape as [#1](#_1-create-subscription-plan))

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Plan not found |
| 500 | Internal Server Error | Server error |

---

#### 4. Update Subscription Plan

**PUT** `/merchant/subscription_plans/:id`

**Path Parameters:** `id` (UUID)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | No | Updated plan name |
| `metadata_uri` | string | No | Updated metadata URI |
| `status` | string (`SubscriptionPlanStatus`) | No | `active` or `inactive` |

**Response:** `SubscriptionPlanResponse` (same shape as [#1](#_1-create-subscription-plan))

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Plan not found |
| 500 | Internal Server Error | Server error |

---

#### 5. Plan Deprecation

The Merchant API mounts POST, GET, and PUT for plans. Deprecation through `DELETE /subscriptions/plans/:id` belongs to the dashboard session API and is not available with merchant API-key authentication.

---

### Subscribers — `/merchant/subscribers`

#### 6. Create Subscriber

**POST** `/merchant/subscribers/`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `subscription_plan_id` | string (UUID) | Yes | Plan to subscribe to |
| `customer_id` | string | No | Your internal customer identifier |
| `customer_name` | string | No | Customer's full name |
| `customer_email` | string | No | Customer's email address |
| `webhook_metadata` | object | No | Copied to subscription creation/invitation events; not automatically included in renewal event DTOs |
| `failure_return_url` | string | No | URL to redirect to on failed enrollment |
| `success_return_url` | string | No | URL to redirect to on successful enrollment |

**Create response (201):** `data` contains `subscriber` (the stored subscriber model) and `subscription_link` (the customer enrollment URL). The raw model uses capitalized `Status` and `WebhookMetadata`; customer fields, return URLs, and timestamps use snake_case. Single-subscriber get/update endpoints also return this raw model. List endpoints use the `SubscriberResponse` DTO shown below.

```json
{
  "message": "Subscriber created successfully",
  "data": {
    "subscriber": {
      "id": "5d17b0c4-b32c-40dd-a2e2-8ace612251c7",
      "subscription_plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
      "merchant_user_id": "11111111-1111-1111-1111-111111111111",
      "customer_name": "John Doe",
      "customer_email": "customer@example.com",
      "Status": "invitation_sent"
    },
    "subscription_link": "https://pay.bitxpay.com/subscriptions/subscription_link?subscription_id=5d17b0c4-b32c-40dd-a2e2-8ace612251c7"
  }
}
```

The example omits other stored model fields. Include `customer_name` and `customer_email` for merchant creation: the notification service currently reads both values without a nil check, despite their being optional in the shared DTO.

**List item data (`SubscriberResponse`):**

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

**GET** `/merchant/subscribers/`

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
  "data": null,
  "total": 0,
  "page": 0,
  "page_size": 0,
  "total_pages": 0
}
```

---

#### 8. Get Subscribers By Plan ID

**GET** `/merchant/subscribers/plan/:plan_id`

**Path Parameters:** `plan_id` (UUID)

**Response:** `data` is a `SubscriberListResponse` object with `subscribers` and `total`. It returns all matches; `page`, `page_size`, and `total_pages` are zero, and the unused legacy `data` field is null.

---

#### 9. Update Subscriber

**PUT** `/merchant/subscribers/:id`

**Path Parameters:** `id` (UUID)

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `customer_name` | string | No | Updated customer name |
| `customer_email` | string | No | Updated customer email |
| `status` | string (`SubscriberStatus`) | No | New subscriber status |

**Response:** The stored subscriber model described in [#6](#_6-create-subscriber), including capitalized `Status` and `WebhookMetadata`. Merchant responses wrap it in `data`; public responses return it directly.

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscriber not found |
| 500 | Internal Server Error | Server error |

---

#### 10. Get Subscriber By ID

**GET** `/merchant/subscribers/:id`

**Path Parameters:** `id` (UUID)

**Response:** The stored subscriber model described in [#6](#_6-create-subscriber), including capitalized `Status` and `WebhookMetadata`. Merchant responses wrap it in `data`; public responses return it directly.

**Error Responses:**

| Status | Error | Description |
|--------|-------|-------------|
| 401 | Unauthorized | Missing or invalid API key/signature |
| 404 | Not Found | Subscriber not found |
| 500 | Internal Server Error | Server error |

---

### Invitations — `/merchant/subscribers/invitations`

#### 11. Get Invitations

**GET** `/merchant/subscribers/invitations`

**Query Parameters:** `page`, `page_size`, `search`, `plan_id`, `start_date`, `end_date`, `sort_order` (same list-filter DTO as subscribers).

**Response (`InvitationListResponse`):**

```json
{
  "invitations": [ { "...": "SubscriberResponse, see #6" } ],
  "data": null,
  "total": 0,
  "page": 0,
  "page_size": 0,
  "total_pages": 0
}
```

---

### Subscription Links — `/merchant/subscription_links`

#### 12. List Subscription Links

**GET** `/merchant/subscription_links/`

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

**GET** `/merchant/subscription_links/:id`

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
  "subscription_transactions": [ { "...": "SubscriptionResponse; see Request and Response Fields" } ],
  "plan": { "...": "SubscriptionPlanSummary" },
  "created_at": "",
  "updated_at": ""
}
```

---

## Public Routes

Public controllers return their response data directly, without the merchant `message`/`data` wrapper, except where explicitly documented below. The endpoints in this section are called directly from the customer-facing wallet/checkout flow and do **not** require `X-API-Key`/`X-API-Signature` headers. [Record Subscription Payment](#_21-record-subscription-payment) additionally requires a `merchant_key` reference in the body; this is separate from request-signature authentication.

### Subscription Plans — `/public/subscriptions/plans`

#### 14. List Public Subscription Plans

**GET** `/public/subscriptions/plans/`

**Query parameters:** `page`, `page_size`, `search`, `deprecated`, `start_date`, `end_date` (same filters as the merchant plan list).

**Response:** `SubscriptionPlanListResponse` (same shape as [#2](#_2-list-subscription-plans))

---

#### 15. Get Public Subscription Plan

**GET** `/public/subscriptions/plans/:id`

**Path Parameters:** `id` (UUID)

**Response:** `SubscriptionPlanResponse` (same shape as [#1](#_1-create-subscription-plan))

---

### Subscribers — `/public/subscriber`

#### 16. Prepare Subscription

**GET** `/public/subscriber/prepare`

**Query parameters:** `subscriber_id` (required UUID) and `wallet_address` (customer wallet address).

Returns an unwrapped object with `subscriber_id`, `plan_id`, `wallet_address`, `currency`, `value`, and `networks`. Each network contains `chain_id` and `tokens`; tokens include `address`, `symbol`, `decimals`, `quotable`, and optional `price`, `amount`, or `error`. Use this treasury-supported selection when preparing enrollment. Invalid subscriber IDs return `400`; missing subscribers/plans return `404`.

---

#### 17. Get Subscriber By ID

**GET** `/public/subscriber/:id`

**Path Parameters:** `id` (UUID)

**Response:** The stored subscriber model described in [#6](#_6-create-subscriber), including capitalized `Status` and `WebhookMetadata`. Merchant responses wrap it in `data`; public responses return it directly.

---

#### 18. Update Subscriber

**PUT** `/public/subscriber/:id`

**Path Parameters:** `id` (UUID)

**Request Body:** `UpdateSubscriberRequest` (same fields as [#9](#_9-update-subscriber))

**Response:** The stored subscriber model described in [#6](#_6-create-subscriber), including capitalized `Status` and `WebhookMetadata`. Merchant responses wrap it in `data`; public responses return it directly.

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
| `chain_id` | integer | Yes | Non-zero chain ID |
| `decimals` | integer | Yes | Non-zero token decimals |

**Response:** `SubscriptionLinkResponse` (same shape as [#13](#_13-get-subscription-link))

---

#### 20. Get Subscription Links By Wallet

**GET** `/public/subscriptions/link/:walletAddress`

**Path Parameters:** `walletAddress` (string)

**Response:** `{ "data": [...], "total": 0 }`, where `data` holds stored subscription link models. This wallet lookup is not the paginated merchant link DTO. No matches return `404`.

---

#### 21. Record Subscription Payment

**POST** `/public/subscriptions/link/payment`

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sub_link_id` | string (UUID) | Yes | Subscription link ID |
| `merchant_key` | string | Yes | Merchant reference stored with the payment record |
| `tx_hash` | string | Yes | Blockchain transaction hash |
| `block_number` | integer | No | Block number the transaction was included in |
| `block_hash` | string | No | Block hash |
| `network_id` | string (UUID) | Yes | Blockchain network ID |
| `currency_id` | string (UUID) | Yes | Currency ID |
| `amount_paid` | string | Yes | Amount paid |
| `wallet_used` | string | Yes | Wallet address the payment was made from |

**Response (200):**

```json
{
  "message": "Payment recorded successfully"
}
```

This endpoint returns an acknowledgement rather than a subscription payment DTO.

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

**Response:** `SubscriptionLinkResponse` (same shape as [#13](#_13-get-subscription-link))

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

The mounted subscription routes use payment/default rate limiters, both configured to 100 requests per minute in this checkout. Limiter identity falls back to client IP when no recognized user/API-key context is available. Handle HTTP `429` and honor `Retry-After` when present; deployment settings may differ.

---

## Common Use Cases

### Create a Subscription Plan

```bash
curl -X POST {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscriptionPlans }}/ \
  -H "X-API-Key: btxm_9b451fa04a2e" \
  -H "X-API-Signature: <base64_encoded_ed25519_signature>" \
  -H "X-API-Timestamp: 2026-01-31T12:00:00Z" \
  -H "Content-Type: application/json" \
  -d '{
    "merchant": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3",
    "destination": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3",
    "token": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
    "amount": "100000",
    "interval": 2592000,
    "max_arrears": 1,
    "plan_nonce": 1,
    "merchant_sig": "<merchant_onchain_signature>",
    "name": "Pro Plan Monthly"
  }'
```

### Create a Subscriber

```bash
curl -X POST {{ $api.sandbox.baseUrl }}{{ $api.endpoints.subscribers }}/ \
  -H "X-API-Key: btxm_9b451fa04a2e" \
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
    "merchant_key": "btxm_9b451fa04a2e",
    "tx_hash": "0xa1b2c3d4e5f60789a1b2c3d4e5f60789a1b2c3d4e5f60789a1b2c3d4e5f60785",
    "network_id": "0b4f3bab-4354-4373-9821-c8665fffbca3",
    "currency_id": "d4e5f6a7-8b9c-4d1e-9f2a-3b4c5d6e7f80",
    "amount_paid": "49.99",
    "wallet_used": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3"
  }'
```

---

## Webhooks

Configure active subscriptions in the dashboard. Subscription event codes defined by the backend are `subscription_plan.created`, `subscription_invitation.created`, `subscription.created`, `subscription.renewed`, and `subscription.renewal_failed`. Availability depends on the operation and enabled catalog entries.

See the [event data reference](/api-reference/webhook-events#subscription-created) for exact fields and emission behavior. Merchant subscriber creation emits `subscription.created` before on-chain enrollment; dashboard subscriber creation emits `subscription_invitation.created`. The plan-created and renewal event DTOs exist, but this checkout has no automatic producers for those three event types. Use the [test-notification API](/api-reference/webhooks#register-a-test-event) to exercise them. See the [Webhooks Guide](/get-started/webhooks) for signature verification.

---

## Support

For questions or issues:

- **Documentation:** {{ $site.urls.support.documentation }}
- **Email:** {{ $site.urls.support.email }}
- **API Status:** {{ $site.urls.support.statusPage }}
