---
title: Webhook Event Data
description: Exact fields, serialization, and examples for all BITXpay merchant webhook event payloads.
---

# Webhook Event Data

This reference is generated from the backend notification DTOs, event constants, and event-to-payload parser. Producer-specific notes explain the behavior of the current checkout. Use the [webhook guide](/get-started/webhooks) for signature verification and the [management reference](/api-reference/webhooks) for configuration and testing.

Download the [JSON Schema](/webhooks/schema.json) and [complete example deliveries](/webhooks/examples.json). These describe merchant deliveries to your URL; engine-to-BITXpay callbacks have a different contract.

## Reading the payload

All fields in the tables are inside the outer delivery's `data` object. “Always” means the JSON field is serialized even when it is an empty string, zero, or false; it does not promise a non-empty value. “When set” means the Go DTO uses omitempty. Examples include serialized defaults and represent the producer described in the notes, except DTO-only events, whose examples are test fixtures.

The outer fields are `id`, `event_type`, `event_id`, `timestamp`, and `data`. Only the outer timestamp is consistently RFC 3339; time strings inside data follow each producer. Amounts below are strings. Keep their event-specific denomination rather than treating every amount as fiat or every string as token base units.

Custom `webhook_metadata` appears only in DTOs that declare it: payment_link.created, subscription.created, and subscription_invitation.created. The notification worker does not merge metadata, order_id, receipt_number, cart, or arbitrary REST response fields into other events.

## payment.succeeded

Engine checkout emits this for a completed link. payment_id is the link UUID and link_id is its deterministic INV-... reference. amount/currency are the link's invoice denomination, not the raw token pay_amount. asset and fees are currently empty strings. Legacy listeners can instead use the payment token denomination. Overpaid engine orders emit transaction.overpaid rather than this event.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `merchant_name` | string | When set | Merchant display name when supplied by the producer. |
| `link_id` | string | Always | Payment link UUID for link creation; INV-... display reference for engine payment status events. |
| `payment_id` | string | Always | Payment link UUID for engine payment events; dispute UUID for refund events. See event notes. |
| `amount` | string | Always | Amount string in this event's currency; see event notes for denomination. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `transaction_hash` | string | Always | Transaction hash when available; may be an empty string. |
| `network` | string | Always | Network name, or chain ID as a string when a name cannot be resolved. |
| `asset` | string | Always | Producer-supplied asset/network label; currently empty for engine success/failure notifications. |
| `fees` | string | Always | Producer-supplied fee string; currently empty for engine success/failure notifications. |
| `received_at` | string | Always | Producer event time; engine success uses Go Time.String(), not the outer RFC 3339 format. |

Example data (PaymentReceivedPayload):

```json
{
  "event_code": "payment.succeeded",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "link_id": "INV-EIRCEI-DQ",
  "payment_id": "22222222-2222-2222-2222-222222222222",
  "amount": "100.50",
  "currency": "USD",
  "transaction_hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "network": "Ethereum",
  "asset": "",
  "fees": "",
  "received_at": "2026-11-16 12:00:00 +0000 UTC"
}
```

## payment.failed

The engine status path emits this for underpaid_expired, using the link amount/currency and the customer contact. asset and fees remain empty; payment_url is omitted by that producer. This code does not imply that every failed operation in the platform emits a webhook.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `merchant_name` | string | When set | Merchant display name when supplied by the producer. |
| `link_id` | string | Always | Payment link UUID for link creation; INV-... display reference for engine payment status events. |
| `payment_id` | string | Always | Payment link UUID for engine payment events; dispute UUID for refund events. See event notes. |
| `amount` | string | Always | Amount string in this event's currency; see event notes for denomination. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `transaction_hash` | string | Always | Transaction hash when available; may be an empty string. |
| `network` | string | Always | Network name, or chain ID as a string when a name cannot be resolved. |
| `asset` | string | Always | Producer-supplied asset/network label; currently empty for engine success/failure notifications. |
| `fees` | string | Always | Producer-supplied fee string; currently empty for engine success/failure notifications. |
| `failed_at` | string | Always | Producer failure time; may use Go Time.String() rather than RFC 3339. |
| `payment_url` | string | When set | Hosted checkout URL when supplied. |

Example data (PaymentFailedPayload):

```json
{
  "event_code": "payment.failed",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "link_id": "INV-EIRCEI-DQ",
  "payment_id": "22222222-2222-2222-2222-222222222222",
  "amount": "100.50",
  "currency": "USD",
  "transaction_hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "network": "Ethereum",
  "asset": "",
  "fees": "",
  "failed_at": "2026-11-16 12:00:00 +0000 UTC"
}
```

## payment.partial_succeeded

Engine underpaid_processing notifications use the catalog token symbol and display amounts obtained from pay_amount/observed plus token decimals. They are not fiat invoice amounts or raw base-unit integers. The engine producer includes payment_id, network, payment_url, and payment_date_time. Total = partial + remaining. Missing token metadata or a missing contact can prevent notification registration.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `merchant_name` | string | When set | Merchant display name when supplied by the producer. |
| `link_id` | string | Always | Payment link UUID for link creation; INV-... display reference for engine payment status events. |
| `payment_id` | string | When set | Payment link UUID for engine payment events; dispute UUID for refund events. See event notes. |
| `total_amount` | string | Always | Quoted total amount; engine partial-payment events use display token units. |
| `partial_amount` | string | Always | Amount received so far in the same denomination as total_amount. |
| `remaining_amount` | string | Always | Positive difference between total and received amounts. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `network` | string | When set | Network name, or chain ID as a string when a name cannot be resolved. |
| `payment_url` | string | When set | Hosted checkout URL when supplied. |
| `payment_date_time` | string | When set | Payment detection time; current engine/partial producers use RFC 3339. |

Example data (PartialPaymentPayload):

```json
{
  "event_code": "payment.partial_succeeded",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "merchant_name": "Example Shop",
  "link_id": "INV-EIRCEI-DQ",
  "payment_id": "22222222-2222-2222-2222-222222222222",
  "total_amount": "100.50",
  "partial_amount": "40.25",
  "remaining_amount": "60.25",
  "currency": "USDC",
  "network": "Ethereum",
  "payment_url": "https://pay.bitxpay.com/payment_link?payment_id=22222222-2222-2222-2222-222222222222",
  "payment_date_time": "2026-11-16T12:00:00Z"
}
```

## transaction.overpaid

Engine overpaid_completed and overpayment-liability processing use display token amounts, with currency set to the catalog token symbol. Received = expected + overpaid. The status producer leaves dispute_id empty; the liability producer supplies its dispute UUID, so more than one notification can describe the same overpayment. frontend_url is currently empty for both engine producers. Legacy paths can populate different link/reference fields.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `merchant_name` | string | When set | Merchant display name when supplied by the producer. |
| `link_id` | string | Always | Payment link UUID for link creation; INV-... display reference for engine payment status events. |
| `payment_id` | string | When set | Payment link UUID for engine payment events; dispute UUID for refund events. See event notes. |
| `expected_amount` | string | Always | Expected amount; engine overpayment events use display token units. |
| `received_amount` | string | Always | Received amount in the same denomination as expected_amount. |
| `overpaid_amount` | string | Always | Positive excess above the expected amount. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `network` | string | When set | Network name, or chain ID as a string when a name cannot be resolved. |
| `refund_link` | string | Always | Payer-facing refund/checkout link supplied by the producer. |
| `dispute_id` | string | Always | Dispute UUID when created; can be empty for an order-status notification. |
| `frontend_url` | string | Always | Legacy producer frontend URL; serialized as an empty string when unset. |
| `transaction_hash` | string | When set | Transaction hash when available; may be an empty string. |

Example data (OverpaymentPayload):

```json
{
  "event_code": "transaction.overpaid",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "merchant_name": "Example Shop",
  "link_id": "INV-EIRCEI-DQ",
  "payment_id": "22222222-2222-2222-2222-222222222222",
  "expected_amount": "100.50",
  "received_amount": "105.50",
  "overpaid_amount": "5.00",
  "currency": "USDC",
  "network": "Ethereum",
  "refund_link": "https://pay.bitxpay.com/payment_link?payment_id=22222222-2222-2222-2222-222222222222",
  "dispute_id": "",
  "frontend_url": "",
  "transaction_hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
```

## payment_link.created

Merchant creation emits the link UUID in link_id, its name in name, and amount formatted to two decimals. The customer is the notification recipient; if no customer email is supplied, the merchant contact can be used. The DTO supports the optional fields below, but the current merchant producer only assigns description, max_uses, cart, webhook_metadata, and merchant_customer_id among them. product_name, product_description, success_url, cancel_url, and customer_id can therefore be absent even when REST creation stores them.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `link_id` | string | Always | Payment link UUID for link creation; INV-... display reference for engine payment status events. |
| `name` | string | Always | Payment link name (the payload uses name, while REST creation accepts payment_name). |
| `amount` | string | Always | Amount string in this event's currency; see event notes for denomination. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `description` | string | When set | Optional payment link description. |
| `payment_url` | string | Always | Hosted checkout URL when supplied. |
| `payment_status` | string | Always | Payment link status at notification creation. |
| `payment_type` | string | Always | Payment link type. |
| `starts_at` | string | Always | Link start time; the merchant create producer uses YYYY-MM-DD HH:mm:ss. |
| `expires_at` | string | Always | Link/invitation expiry; format and availability depend on the producer. |
| `max_uses` | integer | When set | Configured maximum number of uses, when present. |
| `current_uses` | integer | Always | Payment link usage count. |
| `is_active` | boolean | Always | Payment link active flag. |
| `product_name` | string | When set | Optional product name. |
| `product_description` | string | When set | Optional product description. |
| `success_url` | string | When set | Optional success redirect URL. |
| `cancel_url` | string | When set | Optional cancellation redirect URL. |
| `cart` | object | When set | Optional original shopping-cart object. |
| `webhook_metadata` | object | When set | Custom metadata copied by this producer; only payloads declaring this field carry it. |
| `merchant_customer_id` | string | When set | Internal merchant-customer record UUID, when provided. |
| `customer_id` | string | When set | Merchant-supplied/generated customer reference, when provided. |
| `created_at` | string | Always | Producer creation time; it can be empty or use a non-RFC-3339 display format. |

Example data (PaymentLinkCreatedPayload):

```json
{
  "event_code": "payment_link.created",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "link_id": "22222222-2222-2222-2222-222222222222",
  "name": "Order #1234",
  "amount": "100.50",
  "currency": "USD",
  "description": "Payment for Order #1234",
  "payment_url": "https://pay.bitxpay.com/payment_link?payment_id=22222222-2222-2222-2222-222222222222",
  "payment_status": "processing",
  "payment_type": "one_time",
  "starts_at": "2026-11-16 12:00:00",
  "expires_at": "2026-11-17 12:00:00",
  "max_uses": 1,
  "current_uses": 0,
  "is_active": true,
  "cart": {
    "items": [
      {
        "name": "Example Product",
        "quantity": 1,
        "unit_price": 100.5,
        "total": 100.5
      }
    ],
    "total": 100.5
  },
  "webhook_metadata": {
    "order_ref": "order-1234"
  },
  "merchant_customer_id": "33333333-3333-3333-3333-333333333333",
  "created_at": "2026-11-16 12:00:00"
}
```

## payment.expired

Engine status sync emits this when the mapped link status becomes expired. link_id is an INV-... reference. amount/currency are the invoice denomination and expires_at is RFC 3339 when present. Notification registration requires a usable customer contact; API expiry/deactivation alone is not a guarantee of delivery.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `merchant_name` | string | When set | Merchant display name when supplied by the producer. |
| `link_id` | string | Always | Payment link UUID for link creation; INV-... display reference for engine payment status events. |
| `amount` | string | When set | Amount string in this event's currency; see event notes for denomination. |
| `currency` | string | When set | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `expires_at` | string | When set | Link/invitation expiry; format and availability depend on the producer. |

Example data (PaymentLinkExpiredPayload):

```json
{
  "event_code": "payment.expired",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "link_id": "INV-EIRCEI-DQ",
  "amount": "100.50",
  "currency": "USD",
  "expires_at": "2026-11-17T12:00:00Z"
}
```

## refund.initiated

The payer refund-request path emits this after marking a dispute as payer-initiated. payment_id is the dispute UUID, not the payment link UUID. refund_amount and currency come from the dispute. submitted_at is the request time, not the earlier dispute creation time.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `merchant_name` | string | When set | Merchant display name when supplied by the producer. |
| `payment_id` | string | Always | Payment link UUID for engine payment events; dispute UUID for refund events. See event notes. |
| `refund_amount` | string | Always | Refund amount in the stated currency. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `reason` | string | Always | Refund request or renewal failure reason. |
| `submitted_at` | string | When set | Refund request time when available; current payer-request path uses RFC 3339. |

Example data (RefundRequestedPayload):

```json
{
  "event_code": "refund.initiated",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "payment_id": "44444444-4444-4444-4444-444444444444",
  "refund_amount": "5.00",
  "currency": "USDC",
  "reason": "Customer requested refund",
  "submitted_at": "2026-11-16T12:00:00Z"
}
```

## refund.succeeded

Dispute/refund resolution paths emit this. payment_id is the dispute UUID. transaction_hash, asset, and destination_address may be empty strings, and refunded_at can be omitted. Treat the payload as the backend's refund-resolution notification; a populated on-chain refund transaction is not guaranteed.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `merchant_name` | string | When set | Merchant display name when supplied by the producer. |
| `payment_id` | string | Always | Payment link UUID for engine payment events; dispute UUID for refund events. See event notes. |
| `refund_amount` | string | Always | Refund amount in the stated currency. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `transaction_hash` | string | Always | Transaction hash when available; may be an empty string. |
| `asset` | string | Always | Producer-supplied asset/network label; currently empty for engine success/failure notifications. |
| `destination_address` | string | Always | Refund recipient wallet address when known; may be empty. |
| `refunded_at` | string | When set | Optional refund time; some dispute producers leave it unset. |

Example data (RefundCompletedPayload):

```json
{
  "event_code": "refund.succeeded",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "payment_id": "44444444-4444-4444-4444-444444444444",
  "refund_amount": "5.00",
  "currency": "USDC",
  "transaction_hash": "",
  "asset": "Ethereum",
  "destination_address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3"
}
```

## subscription_plan.created

The DTO/parser support this event, but this checkout has no automatic production caller constructing SubscriptionPlanCreatedPayload. It can be registered through the authenticated notification test API. Do not assume create-plan emits it automatically.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `plan_id` | string | Always | Subscription plan database UUID. |
| `plan_name` | string | Always | Plan name when populated; some producers serialize an empty string. |
| `amount` | string | Always | Amount string in this event's currency; see event notes for denomination. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `interval` | string | Always | String billing interval; some producers leave it empty. This payload field is not an integer. |
| `trial_period` | string | When set | Optional trial period string. |
| `created_at` | string | Always | Producer creation time; it can be empty or use a non-RFC-3339 display format. |

Example data (SubscriptionPlanCreatedPayload):

```json
{
  "event_code": "subscription_plan.created",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
  "plan_name": "Pro Monthly",
  "amount": "100.50",
  "currency": "USD",
  "interval": "2592000",
  "trial_period": "604800",
  "created_at": "2026-11-16 12:00:00"
}
```

## subscription.created

The merchant create-subscriber path emits this during invitation creation, before on-chain enrollment. subscription_id is generated from the subscriber UUID as an INV-... display reference, and plan_id is the plan UUID. That producer leaves plan_name, amount, currency, interval, and subscribed_at as empty strings and omits trial_expiry. webhook_metadata is copied when supplied. This event alone is not proof of an on-chain subscription payment.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `subscription_id` | string | Always | Subscription reference; merchant subscriber creation uses an INV-... display reference. |
| `plan_id` | string | Always | Subscription plan database UUID. |
| `plan_name` | string | Always | Plan name when populated; some producers serialize an empty string. |
| `amount` | string | Always | Amount string in this event's currency; see event notes for denomination. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `interval` | string | Always | String billing interval; some producers leave it empty. This payload field is not an integer. |
| `trial_expiry` | string | When set | Optional trial expiry string. |
| `subscribed_at` | string | Always | Subscription event time; merchant subscriber creation leaves this as an empty string. |
| `webhook_metadata` | object | When set | Custom metadata copied by this producer; only payloads declaring this field carry it. |

Example data (SubscribedPayload):

```json
{
  "event_code": "subscription.created",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "subscription_id": "INV-LUL3BR-MX",
  "plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
  "plan_name": "",
  "amount": "",
  "currency": "",
  "interval": "",
  "subscribed_at": "",
  "webhook_metadata": {
    "order_ref": "order-1234"
  }
}
```

## subscription.renewed

The DTO/parser support this event, but this checkout has no automatic production caller constructing SubscriptionRenewedPayload. It can be registered through the authenticated notification test API. Do not assume every recurring payment produces this event.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `subscription_id` | string | Always | Subscription reference; merchant subscriber creation uses an INV-... display reference. |
| `plan_id` | string | Always | Subscription plan database UUID. |
| `plan_name` | string | Always | Plan name when populated; some producers serialize an empty string. |
| `amount` | string | Always | Amount string in this event's currency; see event notes for denomination. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `transaction_hash` | string | Always | Transaction hash when available; may be an empty string. |
| `network` | string | Always | Network name, or chain ID as a string when a name cannot be resolved. |
| `next_renewal_at` | string | Always | Next renewal time supplied by the producer. |
| `renewed_at` | string | Always | Renewal time supplied by the producer. |

Example data (SubscriptionRenewedPayload):

```json
{
  "event_code": "subscription.renewed",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "subscription_id": "INV-LUL3BR-MX",
  "plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
  "plan_name": "Pro Monthly",
  "amount": "10.00",
  "currency": "USDC",
  "transaction_hash": "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "network": "Ethereum",
  "next_renewal_at": "2026-12-16T12:00:00Z",
  "renewed_at": "2026-11-16T12:00:00Z"
}
```

## subscription.renewal_failed

The DTO/parser support this event, but this checkout has no automatic production caller constructing SubscriptionRenewalFailedPayload. It can be registered through the authenticated notification test API.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `subscription_id` | string | Always | Subscription reference; merchant subscriber creation uses an INV-... display reference. |
| `plan_id` | string | Always | Subscription plan database UUID. |
| `plan_name` | string | Always | Plan name when populated; some producers serialize an empty string. |
| `amount` | string | Always | Amount string in this event's currency; see event notes for denomination. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `reason` | string | Always | Refund request or renewal failure reason. |
| `grace_deadline` | string | Always | Grace deadline supplied by the producer. |
| `failed_at` | string | Always | Producer failure time; may use Go Time.String() rather than RFC 3339. |

Example data (SubscriptionRenewalFailedPayload):

```json
{
  "event_code": "subscription.renewal_failed",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "subscription_id": "INV-LUL3BR-MX",
  "plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
  "plan_name": "Pro Monthly",
  "amount": "10.00",
  "currency": "USDC",
  "reason": "Charge could not be collected",
  "grace_deadline": "2026-11-19T12:00:00Z",
  "failed_at": "2026-11-16 12:00:00 +0000 UTC"
}
```

## subscription_invitation.created

The dashboard subscriber path emits this using invitation_id = subscriber UUID and an enrollment invitation_url. It copies webhook_metadata. Its current producer sets the plan amount but leaves currency, interval, expires_at, and created_at as empty strings. The merchant create-subscriber path uses subscription.created instead.

| Field | JSON type | Serialized | Meaning |
|-------|-----------|------------|---------|
| `event_code` | string | Always | Same event code as the outer event_type. |
| `customer_email` | string | Always | Notification recipient email; may be the latest payer, customer, or merchant depending on the producer. |
| `customer_name` | string | Always | Notification recipient display name. |
| `invitation_id` | string | Always | Subscriber invitation UUID (the Go field is named LinkID). |
| `plan_id` | string | Always | Subscription plan database UUID. |
| `plan_name` | string | Always | Plan name when populated; some producers serialize an empty string. |
| `amount` | string | Always | Amount string in this event's currency; see event notes for denomination. |
| `currency` | string | Always | Amount denomination, which can be an invoice currency or a paid token symbol depending on the event. |
| `interval` | string | Always | String billing interval; some producers leave it empty. This payload field is not an integer. |
| `invitation_url` | string | Always | Customer enrollment URL. |
| `expires_at` | string | Always | Link/invitation expiry; format and availability depend on the producer. |
| `created_at` | string | Always | Producer creation time; it can be empty or use a non-RFC-3339 display format. |
| `message` | string | When set | Optional invitation message. |
| `webhook_metadata` | object | When set | Custom metadata copied by this producer; only payloads declaring this field carry it. |

Example data (SubscriptionInvitationCreatedPayload):

```json
{
  "event_code": "subscription_invitation.created",
  "customer_email": "customer@example.com",
  "customer_name": "Alex Customer",
  "invitation_id": "5d17b0c4-b32c-40dd-a2e2-8ace612251c7",
  "plan_id": "6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c",
  "plan_name": "Pro Monthly",
  "amount": "10000000",
  "currency": "",
  "interval": "",
  "invitation_url": "https://pay.bitxpay.com/subscriptions/subscription_link?subscription_id=5d17b0c4-b32c-40dd-a2e2-8ace612251c7",
  "expires_at": "",
  "created_at": "",
  "webhook_metadata": {
    "order_ref": "order-1234"
  }
}
```

