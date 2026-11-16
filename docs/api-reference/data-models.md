---
title: Request and Response Fields
description: Source-derived field names and types for current payment, checkout, subscription, and webhook models.
---

# Request and Response Fields

This generated reference lists the exact field names and types in the backend models used by the integration APIs. Use the endpoint guides for HTTP status, envelopes, defaults, and service behavior. [Download the field contracts](/api/field-contracts.json).

Names are case-sensitive. JSON fields without omitempty remain present when empty or zero; pointers can be null. A Go time.Time is encoded as an RFC 3339 string and can remain present even with an omitempty tag. Array/map fields without omitempty can be null when uninitialized. Shared request validation tags describe declared constraints; controller/service behavior determines which are enforced. Request optionality is not implied by the response serialization column.

Webhook event data has its own [complete reference](/api-reference/webhook-events); webhook management responses below are not the data object of an event. Engine amounts are decimal strings in base units in the engine response, while compatibility checkout uses display numbers for top-level amount fields.

## Merchant payments

### MerchantCreatePaymentLinkRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `payment_name` | string | json | Included | `required,min=1,max=100` |
| `description` | string | json | omitempty; nullable | `omitempty,max=1000` |
| `amount` | number | json | Included | `required,gt=0` |
| `currency` | string | json | Included | `required,min=3,max=10` |
| `starts_at` | RFC 3339 string | json | omitempty; nullable | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `max_uses` | integer | json | omitempty; nullable | `omitempty,gt=0` |
| `customer_id` | string | json | omitempty; nullable | `omitempty,min=1,max=100` |
| `customer_name` | string | json | omitempty; nullable | `omitempty,min=1,max=100` |
| `customer_email` | string | json | omitempty; nullable | `omitempty,email,max=100` |
| `product_name` | string | json | omitempty; nullable | `omitempty,min=1,max=200` |
| `product_description` | string | json | omitempty; nullable | `omitempty,max=1000` |
| `cart` | object | json | omitempty; nullable | — |
| `order_id` | string | json | omitempty; nullable | `omitempty,min=1,max=200` |
| `auto_fill` | boolean | json | omitempty; nullable | — |
| `is_test` | boolean | json | omitempty; nullable | — |
| `success_url` | string | json | omitempty; nullable | `omitempty,url,max=500` |
| `cancel_url` | string | json | omitempty; nullable | `omitempty,url,max=500` |
| `webhook_metadata` | object | json | omitempty; nullable | — |

### PaymentLinkFilterRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `page` | integer | query | Included | `omitempty,min=1` |
| `limit` | integer | query | Included | `omitempty,min=1,max=100` |
| `status` | string | query | Included; nullable | `omitempty,oneof=pending completed expired cancelled` |
| `is_active` | boolean | query | Included; nullable | — |
| `currency` | string | query | Included; nullable | `omitempty,min=3,max=10` |
| `min_amount` | number | query | Included; nullable | `omitempty,gt=0` |
| `max_amount` | number | query | Included; nullable | `omitempty,gt=0` |
| `created_from` | RFC 3339 string | query | Included; nullable | — |
| `created_to` | RFC 3339 string | query | Included; nullable | — |
| `search` | string | query | Included; nullable | `omitempty,max=100` |
| `sort_by` | string | query | Included; nullable | `omitempty,oneof=created_at updated_at amount name` |
| `sort_order` | string | query | Included; nullable | `omitempty,oneof=asc desc` |

### PaginationMeta

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `current_page` | integer | json | Included | — |
| `per_page` | integer | json | Included | — |
| `total_pages` | integer | json | Included | — |
| `total_records` | integer | json | Included | — |
| `has_next_page` | boolean | json | Included | — |
| `has_prev_page` | boolean | json | Included | — |

### ListPaymentLinksResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `data` | array of MerchantPaymentLinkListResponse object | json | Included; nullable | — |
| `pagination` | PaginationMeta object | json | Included | — |
| `filters` | AppliedFilters object | json | omitempty; nullable | — |

### AppliedFilters

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `status` | string | json | omitempty; nullable | — |
| `is_active` | boolean | json | omitempty; nullable | — |
| `currency` | string | json | omitempty; nullable | — |
| `min_amount` | number | json | omitempty; nullable | — |
| `max_amount` | number | json | omitempty; nullable | — |
| `created_from` | RFC 3339 string | json | omitempty; nullable | — |
| `created_to` | RFC 3339 string | json | omitempty; nullable | — |
| `search` | string | json | omitempty; nullable | — |
| `sort_by` | string | json | Included | — |
| `sort_order` | string | json | Included | — |

### MerchantPaymentLinkResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | string | json | Included | — |
| `receipt_number` | string | json | omitempty; nullable | — |
| `merchant_id` | string | json | Included | — |
| `payment_name` | string | json | Included | — |
| `description` | string | json | omitempty; nullable | — |
| `amount` | number | json | Included | — |
| `currency` | string | json | Included | — |
| `payment_url` | string | json | Included | — |
| `payment_status` | string | json | Included | — |
| `payment_type` | string | json | Included | — |
| `source` | string | json | Included | — |
| `starts_at` | RFC 3339 string | json | omitempty | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `max_uses` | integer | json | omitempty; nullable | — |
| `current_uses` | integer | json | Included | — |
| `is_active` | boolean | json | Included | — |
| `is_test` | boolean | json | Included | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `product_name` | string | json | omitempty; nullable | — |
| `product_description` | string | json | omitempty; nullable | — |
| `cart` | object | json | omitempty; nullable | — |
| `success_url` | string | json | omitempty; nullable | — |
| `cancel_url` | string | json | omitempty; nullable | — |
| `webhook_metadata` | object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

### MerchantPaymentLinkCreateResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | string | json | Included | — |
| `receipt_number` | string | json | omitempty; nullable | — |
| `payment_name` | string | json | Included | — |
| `description` | string | json | omitempty; nullable | — |
| `amount` | number | json | Included | — |
| `currency` | string | json | Included | — |
| `payment_url` | string | json | Included | — |
| `payment_status` | string | json | Included | — |
| `payment_type` | string | json | Included | — |
| `source` | string | json | Included | — |
| `starts_at` | RFC 3339 string | json | omitempty | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `max_uses` | integer | json | omitempty; nullable | — |
| `current_uses` | integer | json | Included | — |
| `is_active` | boolean | json | Included | — |
| `is_test` | boolean | json | Included | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `product_name` | string | json | omitempty; nullable | — |
| `product_description` | string | json | omitempty; nullable | — |
| `cart` | object | json | omitempty; nullable | — |
| `order_id` | string | json | omitempty; nullable | — |
| `auto_fill` | boolean | json | Included | — |
| `success_url` | string | json | omitempty; nullable | — |
| `cancel_url` | string | json | omitempty; nullable | — |
| `webhook_metadata` | object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |

### MerchantPaymentLinkListResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | string | json | Included | — |
| `receipt_number` | string | json | omitempty; nullable | — |
| `payment_name` | string | json | Included | — |
| `description` | string | json | omitempty; nullable | — |
| `amount` | number | json | Included | — |
| `currency` | string | json | Included | — |
| `payment_url` | string | json | Included | — |
| `payment_status` | string | json | Included | — |
| `payment_type` | string | json | Included | — |
| `source` | string | json | Included | — |
| `starts_at` | RFC 3339 string | json | omitempty | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `max_uses` | integer | json | omitempty; nullable | — |
| `current_uses` | integer | json | Included | — |
| `is_active` | boolean | json | Included | — |
| `is_expired` | boolean | json | Included | — |
| `is_test` | boolean | json | Included | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `product_name` | string | json | omitempty; nullable | — |
| `product_description` | string | json | omitempty; nullable | — |
| `cart` | object | json | omitempty; nullable | — |
| `order_id` | string | json | omitempty; nullable | — |
| `auto_fill` | boolean | json | Included | — |
| `success_url` | string | json | omitempty; nullable | — |
| `cancel_url` | string | json | omitempty; nullable | — |
| `webhook_metadata` | object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |

### MerchantPaymentLinkDetailResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | string | json | Included | — |
| `receipt_number` | string | json | omitempty; nullable | — |
| `payment_name` | string | json | Included | — |
| `description` | string | json | omitempty; nullable | — |
| `amount` | number | json | Included | — |
| `currency` | string | json | Included | — |
| `payment_url` | string | json | Included | — |
| `payment_status` | string | json | Included | — |
| `payment_type` | string | json | Included | — |
| `source` | string | json | Included | — |
| `starts_at` | RFC 3339 string | json | omitempty | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `max_uses` | integer | json | omitempty; nullable | — |
| `current_uses` | integer | json | Included | — |
| `is_active` | boolean | json | Included | — |
| `is_expired` | boolean | json | Included | — |
| `is_test` | boolean | json | Included | — |
| `settlement_status` | string | json | omitempty; nullable | — |
| `usd_value` | number | json | omitempty; nullable | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `product_name` | string | json | omitempty; nullable | — |
| `product_description` | string | json | omitempty; nullable | — |
| `cart` | object | json | omitempty; nullable | — |
| `order_id` | string | json | omitempty; nullable | — |
| `auto_fill` | boolean | json | Included | — |
| `success_url` | string | json | omitempty; nullable | — |
| `cancel_url` | string | json | omitempty; nullable | — |
| `webhook_metadata` | object | json | omitempty; nullable | — |
| `payers` | array of PayerDetailResponse object | json | omitempty; nullable | — |
| `transactions` | array of TransactionDetailResponse object | json | omitempty; nullable | — |
| `summary` | PaymentSummary object | json | Included | — |
| `created_at` | RFC 3339 string | json | Included | — |

### PayerDetailResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | string | json | Included | — |
| `name` | string | json | Included | — |
| `email` | string | json | Included | — |
| `country` | string | json | omitempty; nullable | — |
| `phone` | string | json | omitempty; nullable | — |
| `wallet_address` | string | json | omitempty; nullable | — |
| `ip_address` | string | json | omitempty; nullable | — |
| `region` | string | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |

### TransactionDetailResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | string | json | Included | — |
| `total_amount_fiat` | number | json | omitempty; nullable | — |
| `total_amount_crypto` | number | json | Included | — |
| `tx_hash` | string | json | omitempty; nullable | — |
| `tx_hash_send_time` | RFC 3339 string | json | omitempty; nullable | — |
| `tx_confirmation_time` | RFC 3339 string | json | omitempty; nullable | — |
| `tx_block` | integer | json | omitempty; nullable | — |
| `network_id` | string | json | Included | — |
| `network_name` | string | json | Included | — |
| `payment_currency` | string | json | omitempty; nullable | — |
| `contract_address` | string | json | omitempty; nullable | — |
| `payment_type` | string | json | omitempty; nullable | — |
| `status` | string | json | omitempty; nullable | — |
| `payment_status` | string | json | omitempty; nullable | — |
| `payment_wallet` | string | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |

### PaymentSummary

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `total_payers` | integer | json | Included | — |
| `total_transactions` | integer | json | Included | — |
| `total_amount_received` | number | json | Included | — |
| `total_amount_received_crypto` | number | json | Included | — |
| `pending_transactions` | integer | json | Included | — |
| `completed_transactions` | integer | json | Included | — |
| `failed_transactions` | integer | json | Included | — |

## Payer checkout

### QuotationRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `srctoken` | string | json | Included | `required` |
| `currency` | string | json | Included | `required` |
| `chainId` | string | json | Included | `required` |
| `paymentlinkId` | string | json | omitempty | — |
| `network` | string | json | omitempty | — |
| `currency_id` | string | json | omitempty | — |
| `payment_type` | string | json | omitempty | — |
| `payer_id` | string | json | omitempty | — |
| `decimals` | integer | json | Included; nullable | — |

### Tempmail

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `email` | string | json | Included | `required` |
| `name` | string | json | Included | `required` |
| `hash` | string | json | Included | — |
| `currency` | string | json | Included | — |
| `id` | string | json | Included | — |
| `merchantId` | string | json | Included | — |
| `expected_amount` | string | json | Included | `required` |
| `received_amount` | string | json | omitempty | — |
| `remaining_amount` | string | json | omitempty | — |
| `payment_type` | string | json | omitempty | — |
| `network` | string | json | omitempty | — |

### TempmailResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `email` | string | json | Included | `required` |
| `expected_amount` | string | json | Included | `required` |
| `received_amount` | string | json | omitempty | — |
| `remaining_amount` | string | json | omitempty | — |
| `payment_type` | string | json | omitempty | — |
| `network` | string | json | omitempty | — |
| `status` | string | json | Included | — |

### PaymentLinkResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `receipt_number` | string | json | omitempty; nullable | — |
| `name` | string | json | Included | — |
| `description` | string | json | omitempty; nullable | — |
| `amount` | number | json | Included | — |
| `currency` | string | json | Included | — |
| `payment_type` | string | json | Included | — |
| `payment_status` | string | json | Included | — |
| `source` | string | json | Included | — |
| `checkout` | string | json | Included | — |
| `settlement_status` | string | json | Included | — |
| `payment_updated_at` | RFC 3339 string | json | Included; nullable | — |
| `payment_link` | string | json | Included | — |
| `starts_at` | RFC 3339 string | json | omitempty | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `is_active` | boolean | json | Included | — |
| `max_uses` | integer | json | omitempty; nullable | — |
| `current_uses` | integer | json | Included | — |
| `merchant_user_id` | UUID string | json | Included | — |
| `merchant_name` | string | json | omitempty; nullable | — |
| `company_name` | string | json | omitempty; nullable | — |
| `merchant_logo` | string | json | omitempty; nullable | — |
| `logo_url` | string | json | omitempty; nullable | — |
| `merchant_address` | string | json | omitempty; nullable | — |
| `merchant_city` | string | json | omitempty; nullable | — |
| `merchant_country` | string | json | omitempty; nullable | — |
| `merchant_email` | string | json | omitempty; nullable | — |
| `merchant_vat_number` | string | json | Included; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |
| `is_expired` | boolean | json | Included | — |
| `is_available` | boolean | json | Included | — |
| `is_test` | boolean | json | Included | — |
| `fiat_asset` | FiatAssetResponse object | json | Included; nullable | — |
| `quote` | Quotation object | json | Included; nullable | — |
| `payers` | array of PayerWithTransactionResponse object | json | Included; nullable | — |
| `merchant_customer` | MerchantCustomerResponse object | json | omitempty; nullable | — |
| `product_name` | string | json | omitempty; nullable | — |
| `product_description` | string | json | omitempty; nullable | — |
| `order_id` | string | json | omitempty; nullable | — |
| `invoice_number` | string | json | omitempty; nullable | — |
| `auto_fill` | boolean | json | Included | — |
| `success_url` | string | json | omitempty; nullable | — |
| `cancel_url` | string | json | omitempty; nullable | — |
| `cart` | object | json | omitempty; nullable | — |
| `webhook_metadata` | object | json | omitempty; nullable | — |
| `order_public_id` | string | json | omitempty | — |
| `order_reference` | string | json | omitempty | — |
| `order_status` | string | json | omitempty | — |
| `order_payer` | string | json | omitempty | — |
| `order_deposit` | string | json | omitempty | — |
| `order_payment_tx` | string | json | omitempty; nullable | — |
| `order_sweep_tx` | string | json | omitempty; nullable | — |
| `order_payout_id` | integer | json | omitempty; nullable | — |
| `order_settle_venue` | string | json | omitempty | — |
| `order_settle_price` | string | json | omitempty | — |
| `order_settle_amount` | string | json | omitempty | — |
| `order_fee_bps` | integer | json | omitempty | — |
| `order_confirmed_at` | RFC 3339 string | json | omitempty; nullable | — |
| `order_expiry` | RFC 3339 string | json | omitempty; nullable | — |
| `order_quote_expiry` | RFC 3339 string | json | omitempty; nullable | — |
| `order_wallet` | OrderWalletResponse object | json | omitempty; nullable | — |

### PaymentLinkValidationResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `is_valid` | boolean | json | Included | — |
| `is_expired` | boolean | json | Included | — |
| `is_available` | boolean | json | Included | — |
| `is_overpaid` | boolean | json | Included | — |
| `payment_status` | string | json | Included | — |
| `starts_at` | RFC 3339 string | json | omitempty | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `amount` | number | json | Included | — |
| `currency` | string | json | Included | — |
| `max_uses` | integer | json | omitempty; nullable | — |
| `current_uses` | integer | json | Included | — |
| `remaining_uses` | integer | json | omitempty; nullable | — |
| `message` | string | json | Included | — |
| `network` | string | json | Included; nullable | — |
| `chain_id` | string | json | Included; nullable | — |
| `token_address` | string | json | Included; nullable | — |
| `engine_status` | string | json | omitempty; nullable | — |
| `payment_tx` | string | json | omitempty; nullable | — |
| `expected_amount` | number | json | omitempty; nullable | — |
| `total_amount_received` | number | json | omitempty; nullable | — |
| `amount_remaining` | number | json | omitempty; nullable | — |
| `excess_amount` | number | json | omitempty; nullable | — |
| `unconfirmed_amount_received` | number | json | omitempty; nullable | — |
| `confirmations` | integer | json | omitempty; nullable | — |
| `required_confirmations` | integer | json | omitempty; nullable | — |
| `breakdown` | EngineQuoteBreakdown object | json | omitempty; nullable | — |

### CreatePayerRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `name` | string | json | Included | `required,min=1,max=100` |
| `email` | string | json | Included | `required,email,max=100` |
| `country` | string | json | omitempty; nullable | `omitempty,max=100` |
| `phone` | string | json | omitempty; nullable | `omitempty,max=100` |
| `payment_link_id` | UUID string | json | Included | `required` |

### PayerResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `name` | string | json | Included | — |
| `email` | string | json | Included | — |
| `country` | string | json | omitempty; nullable | — |
| `phone` | string | json | omitempty; nullable | — |
| `wallet_address` | string | json | omitempty; nullable | — |
| `ip_address` | string | json | omitempty; nullable | — |
| `region` | string | json | omitempty; nullable | — |
| `payment_link_id` | UUID string | json | Included | — |
| `merchant_user_id` | UUID string | json | Included | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

### PaymentLinkPollingResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `is_active` | boolean | json | Included | — |
| `is_expired` | boolean | json | Included | — |
| `starts_at` | RFC 3339 string | json | omitempty | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `expected_amount` | number | json | Included | — |
| `total_amount_received` | number | json | Included | — |
| `amount_remaining` | number | json | Included | — |
| `excess_amount` | number | json | omitempty; nullable | — |
| `is_overpaid` | boolean | json | Included | — |
| `payment_status` | string | json | Included | — |
| `max_uses` | integer | json | omitempty; nullable | — |
| `current_uses` | integer | json | Included | — |
| `remaining_uses` | integer | json | omitempty; nullable | — |
| `time_remaining` | string | json | omitempty; nullable | — |
| `time_remaining_seconds` | integer | json | omitempty; nullable | — |
| `is_available` | boolean | json | Included | — |
| `disputes` | array of DisputePollResponse object | json | omitempty; nullable | — |
| `tokenaddress` | string | json | Included; nullable | — |
| `chainid` | string | json | Included; nullable | — |
| `success_url` | string | json | omitempty; nullable | — |
| `cancel_url` | string | json | omitempty; nullable | — |
| `order_id` | string | json | omitempty; nullable | — |
| `auto_fill` | boolean | json | Included | — |
| `engine_status` | string | json | omitempty; nullable | — |
| `payment_tx` | string | json | omitempty; nullable | — |
| `unconfirmed_amount_received` | number | json | omitempty; nullable | — |
| `confirmations` | integer | json | omitempty; nullable | — |
| `required_confirmations` | integer | json | omitempty; nullable | — |
| `breakdown` | EngineQuoteBreakdown object | json | omitempty; nullable | — |

### QuotationResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `success` | boolean | json | Included | — |
| `status` | integer | json | Included | — |
| `walletAddress` | string | json | Included | — |
| `tokenAmount` | number | json | Included | — |
| `tokenAmountWithoutFee` | number | json | Included | — |
| `feePercentage` | number | json | Included | — |
| `feeAmountToken` | number | json | Included | — |
| `expiryTime` | integer | json | Included | — |
| `paymentexchangeRate` | number | json | Included | — |
| `tokenaddress` | string | json | Included | — |
| `chainId` | string | json | Included | — |
| `hasTransactions` | boolean | json | Included | — |
| `totalAmountReceived` | number | json | Included | — |
| `amountRemaining` | number | json | Included | — |
| `isOverpaid` | boolean | json | Included | — |
| `breakdown` | EngineQuoteBreakdown object | json | omitempty; nullable | — |
| `engine_quote` | JSON value | json | omitempty | — |

### EngineQuoteBreakdown

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `gross_amount` | string | json | omitempty | — |
| `insurance_amount` | string | json | omitempty | — |
| `fee_amount` | string | json | omitempty | — |
| `fee_fixed_amount` | string | json | omitempty | — |
| `gas_amount` | string | json | omitempty | — |
| `pay_amount` | string | json | omitempty | — |
| `fee_bps` | integer | json | Included | — |
| `taker_fee_bps` | integer | json | Included | — |
| `safety_margin_bps` | integer | json | Included | — |
| `raw_price` | string | json | omitempty | — |
| `final_price` | string | json | omitempty | — |
| `venue` | string | json | omitempty | — |
| `gas_side` | string | json | omitempty | — |
| `gas_native_wei` | string | json | omitempty | — |
| `gas_rate` | string | json | omitempty | — |

### PaymentTransactionRequestV2

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `payment_link_id` | UUID string | json | Included | `required` |
| `total_amount_fiat` | number | json | omitempty; nullable | `omitempty,gte=0` |
| `total_amount_crypto` | number | json | Included | `required,gt=0` |
| `tx_hash` | string | json | omitempty; nullable | — |
| `tx_hash_send_time` | RFC 3339 string | json | omitempty; nullable | — |
| `tx_confirmation_time` | RFC 3339 string | json | omitempty; nullable | — |
| `tx_block` | integer | json | omitempty; nullable | — |
| `network_id` | string | json | Included | `required` |
| `network_name` | string | json | Included | `required` |
| `decimals` | integer | json | Included | `required` |
| `payment_wallet` | string | json | Included | `required` |
| `email` | string | json | omitempty | — |
| `payment_currency` | string | json | omitempty; nullable | — |
| `contract_address` | string | json | omitempty; nullable | — |
| `payer_id` | UUID string | json | omitempty; nullable | — |
| `payment_type` | string | json | omitempty; nullable | — |
| `status` | string | json | omitempty; nullable | — |

### PaymentTransactionResponseV2

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `payment_link_id` | UUID string | json | Included | — |
| `total_amount_fiat` | number | json | omitempty; nullable | — |
| `total_amount_crypto` | number | json | Included | — |
| `tx_hash` | string | json | omitempty; nullable | — |
| `tx_hash_send_time` | RFC 3339 string | json | omitempty; nullable | — |
| `tx_confirmation_time` | RFC 3339 string | json | omitempty; nullable | — |
| `tx_block` | integer | json | omitempty; nullable | — |
| `network_id` | string | json | Included | — |
| `network_name` | string | json | Included | — |
| `payment_currency` | string | json | omitempty; nullable | — |
| `contract_address` | string | json | omitempty; nullable | — |
| `payer` | UUID string | json | omitempty; nullable | — |
| `payment_type` | string | json | omitempty; nullable | — |
| `status` | string | json | omitempty; nullable | — |
| `paymentwallet` | string | json | omitempty; nullable | — |
| `paymentstatus` | string | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

## Engine checkout

### payScreenOrder

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `link_id` | string | json | Included | — |
| `status` | string | json | Included | — |
| `chain_id` | integer | json | Included | — |
| `token` | string | json | Included | — |
| `currency` | string | json | Included | — |
| `pay_amount` | string | json | Included | — |
| `deposit` | string | json | Included | — |
| `quote_expiry` | string | json | Included | — |
| `expiry` | string | json | Included | — |
| `observed` | string | json | Included | — |
| `payment_tx` | string | json | omitempty | — |
| `simulated` | boolean | json | omitempty | — |
| `observed_latest` | string | json | omitempty | — |
| `confirmations` | integer | json | Included | — |
| `required_confirmations` | integer | json | Included | — |

### quoteRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `chain_id` | integer | json | Included | — |
| `token` | string | json | omitempty | — |
| `asset` | string | json | omitempty | — |

## Checkout catalog

### CatalogToken

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `token` | string | json | Included | — |
| `symbol` | string | json | Included | — |
| `decimals` | integer | json | Included | — |
| `currencies` | array of string | json | Included; nullable | — |

### CatalogChain

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `chain_id` | integer | json | Included | — |
| `family` | string | json | Included | — |
| `tokens` | array of CatalogToken object | json | Included; nullable | — |

### Catalog

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `currencies` | array of string | json | Included; nullable | — |
| `chains` | array of CatalogChain object | json | Included; nullable | — |

### OrderOptions

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `currencies` | array of string | json | Included; nullable | — |
| `chains` | array of CatalogChain object | json | Included; nullable | — |
| `locked` | boolean | json | Included | — |
| `note` | string | json | Included | — |

## Subscription plans

### CreateSubscriptionPlanRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `network_id` | UUID string | json | Included | — |
| `currency_id` | UUID string | json | Included | — |
| `merchant` | string | json | Included | `required` |
| `destination` | string | json | Included | `required` |
| `token` | string | json | Included | — |
| `currency` | string | json | Included | — |
| `amount` | string | json | Included | — |
| `value` | string | json | Included | — |
| `period` | integer | json | Included | — |
| `interval` | integer | json | Included | `required` |
| `trial_period` | integer | json | Included | — |
| `max_arrears` | integer | json | Included | `required,min=1` |
| `auto_cancel_after_missed` | integer | json | Included | — |
| `subscribe_deadline` | integer | json | Included | — |
| `plan_nonce` | integer | json | Included | `required` |
| `merchant_sig` | string | json | Included | `required` |
| `metadata_uri` | string | json | Included | — |
| `name` | string | json | Included | `required` |
| `description` | string | json | Included | — |
| `kind` | string | json | Included | — |

### UpdateSubscriptionPlanRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `name` | string | json | Included; nullable | — |
| `metadata_uri` | string | json | Included; nullable | — |
| `status` | string | json | Included | — |

### NetworkResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `name` | string | json | Included | — |
| `chain_id` | integer | json | omitempty; nullable | — |
| `symbol` | string | json | omitempty; nullable | — |
| `is_active` | boolean | json | Included | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

### SubscriptionLinkSummary

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `status` | string | json | Included | — |
| `wallet_address` | string | json | omitempty; nullable | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `subscribed_at` | RFC 3339 string | json | omitempty; nullable | — |
| `trial_ends_at` | RFC 3339 string | json | omitempty; nullable | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `last_payment_at` | RFC 3339 string | json | omitempty; nullable | — |
| `last_payment_tx_hash` | string | json | omitempty; nullable | — |
| `failed_attempts` | integer | json | Included | — |
| `is_active` | boolean | json | Included | — |
| `transaction_count` | integer | json | Included | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

### SubscriptionPlanResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `merchant_id` | UUID string | json | Included | — |
| `network_id` | UUID string | json | Included | — |
| `chain_id` | integer | json | Included | — |
| `network` | NetworkResponse object | json | omitempty; nullable | — |
| `merchant_address` | string | json | Included | — |
| `destination_address` | string | json | Included | — |
| `token` | string | json | omitempty | — |
| `currency_id` | UUID string | json | omitempty; nullable | — |
| `currency` | string | json | omitempty | — |
| `currency_symbol` | string | json | omitempty | — |
| `amount` | string | json | Included | — |
| `formatted_amount` | string | json | Included | — |
| `interval` | integer | json | Included | — |
| `trial_period` | integer | json | Included | — |
| `max_arrears` | integer | json | Included | — |
| `auto_cancel_after_missed` | integer | json | Included | — |
| `subscribe_deadline` | integer | json | Included | — |
| `plan_nonce` | integer | json | Included | — |
| `plan_id` | string | json | omitempty | — |
| `digest` | string | json | omitempty | — |
| `revoked` | boolean | json | Included | — |
| `source` | string | json | omitempty | — |
| `metadata_uri` | string | json | Included | — |
| `name` | string | json | Included | — |
| `description` | string | json | Included | — |
| `is_deprecated` | boolean | json | Included | — |
| `deprecated_at` | RFC 3339 string | json | omitempty; nullable | — |
| `status` | string | json | Included | — |
| `total_subscribers` | integer | json | Included | — |
| `active_subscribers` | integer | json | Included | — |
| `trial_subscribers` | integer | json | Included | — |
| `failed_subscribers` | integer | json | Included | — |
| `subscribers` | array of SubscriberWithLinkResponse object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

### SubscriptionPlanListResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `plans` | array of SubscriptionPlanResponse object | json | Included; nullable | — |
| `total` | integer | json | Included | — |
| `page` | integer | json | Included | — |
| `page_size` | integer | json | Included | — |
| `total_pages` | integer | json | Included | — |

### SubscriptionPlanListRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `page` | integer | query | Included | — |
| `page_size` | integer | query | Included | — |
| `search` | string | query | Included | — |
| `deprecated` | boolean | query | Included; nullable | — |
| `start_date` | RFC 3339 string | query | Included; nullable | — |
| `end_date` | RFC 3339 string | query | Included; nullable | — |
| `SortOrder` | string | json | Included | — |

## Subscription enrollment

### ApprovalDetail

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `approval_hash` | string | json | Included | `omitempty` |
| `token_address` | string | json | Included | `required` |
| `amount_approved` | string | json | Included | `required` |
| `network_name` | string | json | Included | `required` |
| `chain_id` | integer | json | Included | `required` |
| `decimals` | integer | json | Included | `required` |

### CreateSubscriptionLinkRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `subscription_plan_id` | UUID string | json | Included | `required` |
| `subscriber_id` | UUID string | json | omitempty; nullable | — |
| `subscription_onchain_id` | integer | json | Included; nullable | — |
| `subscribed_at` | RFC 3339 string | json | Included; nullable | — |
| `trial_ends_at` | RFC 3339 string | json | Included; nullable | — |
| `wallet_address` | string | json | Included | `required` |
| `subscribe_hash` | string | json | Included | `required` |
| `owed` | string | json | Included | — |
| `paid_periods` | integer | json | Included | — |
| `locked` | boolean | json | Included | — |
| `approvals` | array of ApprovalDetail object | json | Included; nullable | `required,min=1,dive` |
| `customer_id` | string | json | Included; nullable | — |
| `customer_email` | string | json | Included; nullable | — |
| `customer_name` | string | json | Included; nullable | — |
| `expires_at` | RFC 3339 string | json | Included; nullable | — |

### UpdateSubscriptionLinkRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `trial_ends_at` | RFC 3339 string | json | Included; nullable | — |
| `customer_email` | string | json | Included; nullable | — |
| `customer_name` | string | json | Included; nullable | — |
| `expires_at` | RFC 3339 string | json | Included; nullable | — |
| `is_active` | boolean | json | Included; nullable | — |
| `locked` | boolean | json | Included; nullable | — |
| `owed` | string | json | Included | — |

### SubscriptionLinkListRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `page` | integer | query | Included | — |
| `page_size` | integer | query | Included | — |
| `search` | string | query | Included | — |
| `is_active` | boolean | query | Included; nullable | — |
| `plan_id` | UUID string | query | Included; nullable | — |
| `start_date` | RFC 3339 string | query | Included; nullable | — |
| `end_date` | RFC 3339 string | query | Included; nullable | — |

### SubscriptionPlanSummary

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `name` | string | json | Included | — |
| `plan_id` | string | json | Included | — |
| `amount` | string | json | Included | — |
| `token` | string | json | Included | — |
| `billing_period` | integer | json | Included | — |
| `trial_period` | integer | json | Included | — |
| `is_deprecated` | boolean | json | Included | — |

### SubscriptionLinkResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `merchant_user_id` | UUID string | json | Included | — |
| `subscription_plan_id` | UUID string | json | Included | — |
| `subscribed_at` | RFC 3339 string | json | omitempty; nullable | — |
| `trial_ends_at` | RFC 3339 string | json | omitempty; nullable | — |
| `wallet_address` | string | json | omitempty; nullable | — |
| `subscribe_hash` | string | json | omitempty; nullable | — |
| `approvals` | array of ApprovalDetail object | json | omitempty; nullable | — |
| `owed` | string | json | Included | — |
| `paid_periods` | integer | json | Included | — |
| `locked` | boolean | json | Included | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `is_active` | boolean | json | Included | — |
| `subscription_transactions` | array of SubscriptionResponse object | json | omitempty; nullable | — |
| `plan` | SubscriptionPlanSummary object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

### SubscriptionLinkListResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `links` | array of SubscriptionLinkResponse object | json | Included; nullable | — |
| `total` | integer | json | Included | — |
| `page` | integer | json | Included | — |
| `page_size` | integer | json | Included | — |
| `total_pages` | integer | json | Included | — |

### RecordSubscriptionPaymentRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `sub_link_id` | UUID string | json | Included | `required` |
| `merchant_key` | string | json | Included | `required` |
| `tx_hash` | string | json | Included | `required` |
| `block_number` | integer | json | omitempty; nullable | — |
| `block_hash` | string | json | omitempty; nullable | — |
| `network_id` | UUID string | json | Included | `required` |
| `currency_id` | UUID string | json | Included | `required` |
| `amount_paid` | string | json | Included | `required` |
| `wallet_used` | string | json | Included | `required` |

### SubscriptionResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `merchant_id` | UUID string | json | Included | — |
| `sub_link_id` | UUID string | json | Included | — |
| `tx_hash` | string | json | Included | — |
| `block_number` | integer | json | omitempty; nullable | — |
| `block_hash` | string | json | omitempty; nullable | — |
| `confirmations` | integer | json | Included | — |
| `currency_id` | UUID string | json | Included | — |
| `network_id` | UUID string | json | Included | — |
| `amount` | string | json | Included | — |
| `user_wallet_address` | string | json | Included | — |
| `paid_at` | RFC 3339 string | json | omitempty; nullable | — |
| `status` | string | json | Included | — |
| `starts_at` | RFC 3339 string | json | Included | — |
| `ends_at` | RFC 3339 string | json | omitempty; nullable | — |
| `next_billing_at` | RFC 3339 string | json | omitempty; nullable | — |
| `plan` | SubscriptionLinkResponse object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

### CreateSubscriberRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `subscription_plan_id` | UUID string | json | Included | `required` |
| `customer_id` | string | json | omitempty; nullable | `omitempty,max=100` |
| `customer_name` | string | json | omitempty; nullable | `omitempty,max=255` |
| `customer_email` | string | json | omitempty; nullable | `omitempty,email,max=255` |
| `webhook_metadata` | object | json | omitempty; nullable | — |
| `failure_return_url` | string | json | omitempty; nullable | — |
| `success_return_url` | string | json | omitempty; nullable | — |

### SubscriberResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `subscription_plan_id` | UUID string | json | Included | — |
| `merchant_user_id` | UUID string | json | Included | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `subscription_link_url` | string | json | Included | — |
| `status` | string | json | Included; nullable | — |
| `subscription_plan` | SubscriptionPlan object | json | omitempty; nullable | — |
| `subscription_link` | SubscriptionLink object | json | omitempty; nullable | — |
| `webhook_metadata` | object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

### SubscriberListRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `plan_id` | UUID string | query | Included; nullable | — |
| `search` | string | query | Included | — |
| `start_date` | RFC 3339 string | query | Included; nullable | — |
| `end_date` | RFC 3339 string | query | Included; nullable | — |
| `page` | integer | query | Included | — |
| `page_size` | integer | query | Included | — |
| `sort_order` | string | query | Included | — |

### UpdateSubscriberRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `customer_name` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `status` | string | json | omitempty; nullable | — |

### SubscriberListResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `subscribers` | array of SubscriberResponse object | json | Included; nullable | — |
| `data` | array of Subscriber object | json | Included; nullable | — |
| `total` | integer | json | Included | — |
| `page` | integer | json | Included | — |
| `page_size` | integer | json | Included | — |
| `total_pages` | integer | json | Included | — |

### InvitationListResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `invitations` | array of SubscriberResponse object | json | Included; nullable | — |
| `data` | array of Subscriber object | json | Included; nullable | — |
| `total` | integer | json | Included | — |
| `page` | integer | json | Included | — |
| `page_size` | integer | json | Included | — |
| `total_pages` | integer | json | Included | — |

### SubscriberWithLinkResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `subscription_plan_id` | UUID string | json | Included | — |
| `merchant_user_id` | UUID string | json | Included | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `subscription_link` | SubscriptionLinkSummary object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |

### SubscriptionMetaAttribute

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `trait_type` | string | json | Included | — |
| `value` | string | json | Included | — |

### SubscriptionMetaResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `name` | string | json | Included | — |
| `description` | string | json | Included | — |
| `image` | string | json | omitempty | — |
| `external_url` | string | json | omitempty | — |
| `attributes` | array of SubscriptionMetaAttribute object | json | Included; nullable | — |

## Subscription preparation

### PrepareToken

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `address` | string | json | Included | — |
| `symbol` | string | json | Included | — |
| `decimals` | integer | json | Included | — |
| `quotable` | boolean | json | Included | — |
| `price` | string | json | omitempty | — |
| `amount` | string | json | omitempty | — |
| `error` | string | json | omitempty | — |

### PrepareNetwork

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `chain_id` | integer | json | Included | — |
| `tokens` | array of PrepareToken object | json | Included; nullable | — |

### PrepareSubscriptionResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `subscriber_id` | UUID string | json | Included | — |
| `plan_id` | UUID string | json | Included | — |
| `wallet_address` | string | json | Included | — |
| `currency` | string | json | Included | — |
| `value` | string | json | Included | — |
| `networks` | array of PrepareNetwork object | json | Included; nullable | — |

## Stored subscriber model

### Subscriber

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `subscription_plan_id` | UUID string | json | Included | — |
| `merchant_user_id` | UUID string | json | Included | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `Status` | string | json | Included; nullable | — |
| `WebhookMetadata` | JSON value | json | Included | — |
| `failure_return_url` | string | json | omitempty; nullable | — |
| `success_return_url` | string | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |
| `subscription_link` | SubscriptionLink object | json | omitempty; nullable | — |
| `subscription_plan` | SubscriptionPlan object | json | omitempty; nullable | — |

## Stored subscription link model

### SubscriptionLink

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `merchant_user_id` | UUID string | json | Included | — |
| `subscription_plan_id` | UUID string | json | Included | — |
| `subscriber_id` | UUID string | json | omitempty; nullable | — |
| `subscribed_at` | RFC 3339 string | json | omitempty; nullable | — |
| `trial_ends_at` | RFC 3339 string | json | omitempty; nullable | — |
| `wallet_address` | string | json | omitempty; nullable | — |
| `subscribe_hash` | string | json | omitempty; nullable | — |
| `Approvals` | array of ApprovalDetail objects | json | Included; nullable | — |
| `approved_contract` | string | json | omitempty; nullable | — |
| `subscription_onchain_id` | integer | json | omitempty; nullable | — |
| `owed` | string | json | Included | — |
| `paid_periods` | integer | json | Included | — |
| `locked` | boolean | json | Included | — |
| `status` | string | json | Included | — |
| `last_payment_at` | RFC 3339 string | json | omitempty; nullable | — |
| `last_payment_tx_hash` | string | json | omitempty; nullable | — |
| `failed_attempts` | integer | json | Included | — |
| `next_billing_at` | RFC 3339 string | json | Included; nullable | — |
| `next_retry_at` | RFC 3339 string | json | Included; nullable | — |
| `error_message` | string | json | omitempty; nullable | — |
| `customer_id` | string | json | omitempty; nullable | — |
| `customer_email` | string | json | omitempty; nullable | — |
| `customer_name` | string | json | omitempty; nullable | — |
| `webhook_metadata` | JSON value | json | omitempty | — |
| `expires_at` | RFC 3339 string | json | omitempty; nullable | — |
| `is_active` | boolean | json | Included | — |
| `is_on_trial` | boolean | json | Included; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | Included | — |
| `subscription_plan` | SubscriptionPlan object | json | omitempty; nullable | — |
| `subscriber` | Subscriber object | json | omitempty; nullable | — |
| `subscription_transactions` | array of SubscriptionPayment object | json | omitempty; nullable | — |

## Webhook management

### CreateWebhookRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `url` | string | json | Included | `required,url` |
| `secret` | string | json | omitempty; nullable | — |
| `event_subscriptions` | array of CreateEventSubscriptionItem object | json | omitempty; nullable | — |

### CreateEventSubscriptionItem

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | `required` |
| `is_active` | boolean | json | Included | — |

### UpdateWebhookRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `url` | string | json | Included; nullable | `omitempty,url` |
| `secret` | string | json | omitempty; nullable | — |
| `is_active` | boolean | json | omitempty; nullable | — |
| `event_ids` | array of UUID string | json | omitempty; nullable | — |
| `event_subscriptions` | array of CreateEventSubscriptionItem object | json | omitempty; nullable | — |

### WebhookEventSubscriptionResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `event_id` | UUID string | json | Included | — |
| `is_active` | boolean | json | Included | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `event` | EventResponse object | json | omitempty; nullable | — |

### EventResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `code` | string | json | Included | — |
| `description` | string | json | Included | — |
| `source` | string | json | Included | — |
| `is_active` | boolean | json | Included | — |
| `created_at` | RFC 3339 string | json | Included | — |

### WebhookResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `url` | string | json | Included | — |
| `secret` | string | json | omitempty; nullable | — |
| `is_active` | boolean | json | Included | — |
| `event_subscriptions` | array of WebhookEventSubscriptionResponse object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |
| `updated_at` | RFC 3339 string | json | omitempty; nullable | — |

### WebhookListResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `webhooks` | array of WebhookResponse object | json | Included; nullable | — |
| `total` | integer | json | Included | — |
| `page` | integer | json | Included | — |
| `page_size` | integer | json | Included | — |
| `total_pages` | integer | json | Included | — |
| `shared_secret` | string | json | omitempty; nullable | — |

### WebhookDeleteResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `success` | boolean | json | Included | — |
| `message` | string | json | omitempty | — |
| `deleted_id` | UUID string | json | Included | — |

### RegenerateSecretResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `success` | boolean | json | Included | — |
| `secret` | string | json | Included | — |
| `message` | string | json | Included | — |

### ValidateSecretRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `secret` | string | json | Included | `required` |

### ValidateSecretResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `valid` | boolean | json | Included | — |
| `message` | string | json | Included | — |

### BulkToggleWebhookSubscriptionsRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `webhook_id` | UUID string | json | Included | `required` |
| `subscriptions` | array of SubscriptionToggleItem object | json | Included; nullable | `required,min=1` |

### SubscriptionToggleItem

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | `required` |
| `is_active` | boolean | json | Included | — |

### BulkToggleWebhookSubscriptionsResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `success` | boolean | json | Included | — |
| `message` | string | json | Included | — |
| `updated_count` | integer | json | Included | — |
| `updated_items` | array of SubscriptionToggleItem object | json | Included; nullable | — |

### WebhookActivityLog

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `webhook_id` | UUID string | json | Included | — |
| `webhook_url` | string | json | Included | — |
| `event_type` | string | json | Included | — |
| `action` | string | json | Included | — |
| `description` | string | json | Included | — |
| `status` | string | json | Included | — |
| `attempts` | integer | json | Included | — |
| `last_attempt_at` | RFC 3339 string | json | omitempty; nullable | — |
| `scheduled_at` | RFC 3339 string | json | Included | — |
| `payload` | JSON value | json | omitempty | — |
| `delivery_attempts` | array of WebhookDeliveryAttempt object | json | omitempty; nullable | — |
| `created_at` | RFC 3339 string | json | Included | — |

### WebhookDeliveryAttempt

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | UUID string | json | Included | — |
| `attempt_number` | integer | json | Included | — |
| `http_status` | integer | json | omitempty; nullable | — |
| `success` | boolean | json | Included | — |
| `error_message` | string | json | omitempty; nullable | — |
| `request_payload` | JSON value | json | omitempty | — |
| `response_payload` | JSON value | json | omitempty | — |
| `created_at` | RFC 3339 string | json | Included | — |

### WebhookActivityResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `activities` | array of WebhookActivityLog object | json | Included; nullable | — |
| `total` | integer | json | Included | — |
| `page` | integer | json | Included | — |
| `page_size` | integer | json | Included | — |
| `total_pages` | integer | json | Included | — |

### RegisterNotificationRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `event_code` | string | json | Included | `required` |
| `payload` | object | json | Included; nullable | `required` |
| `channels` | array of string | json | omitempty; nullable | — |

### RegisterNotificationResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `success` | boolean | json | Included | — |
| `message` | string | json | Included | — |
| `event_code` | string | json | Included | — |
| `triggered_channels` | array of string | json | Included; nullable | — |
| `job_ids` | object | json | Included; nullable | — |

### AcknowledgeWebhookRequest

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `job_id` | string | json | Included | `required` |
| `status_code` | integer | json | Included | `required,min=200,max=599` |
| `response` | string | json | omitempty | — |

### AcknowledgeWebhookResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `success` | boolean | json | Included | — |
| `message` | string | json | Included | — |
| `job_id` | string | json | Included | — |

### PollingInfo

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `next_poll_after` | RFC 3339 string | json | Included | — |
| `recommended_wait_ms` | integer | json | Included | — |

### WebhookEventPayload

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `id` | string | json | Included | — |
| `event_type` | string | json | Included | — |
| `event_id` | string | json | Included | — |
| `timestamp` | string | json | Included | — |
| `data` | object | json | Included; nullable | — |

### WebhookPollingEvent

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `attempt_id` | string | json | Included | — |
| `webhook_id` | string | json | Included | — |
| `webhook_url` | string | json | Included | — |
| `status` | string | json | Included | — |
| `attempt_number` | integer | json | Included | — |
| `http_status` | integer | json | omitempty; nullable | — |
| `error_message` | string | json | omitempty; nullable | — |
| `payload` | WebhookEventPayload object | json | Included | — |
| `sent_at` | RFC 3339 string | json | Included | — |
| `response_body` | JSON value | json | omitempty | — |

### WebhookEventsPollingResponse

| Field | Type | Binding | Serialization | Declared validation |
|-------|------|---------|---------------|---------------------|
| `has_new_events` | boolean | json | Included | — |
| `events` | array of WebhookPollingEvent object | json | Included; nullable | — |
| `count` | integer | json | Included | — |
| `latest_at` | RFC 3339 string | json | omitempty; nullable | — |
| `polling_info` | PollingInfo object | json | Included | — |

