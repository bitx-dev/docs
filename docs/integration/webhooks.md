---
title: Webhooks
description: Configure webhook subscriptions and verify BITXpay event deliveries.
---

# Webhooks

BITXpay sends HTTP POST requests to subscribed webhook URLs. Configure the URL, shared secret, and active events in your dashboard. The [Webhooks Guide](/get-started/webhooks) describes the payload, event codes, retries, and management endpoints.

## Verify deliveries

The header is `X-Webhook-Signature: sha256=<hex>`. Verify HMAC-SHA256 over the exact raw body with your webhook secret before parsing JSON.

::: code-group

<<< @/snippets/webhook.mjs{javascript} [Express.js]

<<< @/snippets/webhook.py{python} [Flask]

:::

## Handle events reliably

Read `event.event_type`, for example `payment.succeeded` or `payment.failed`. Event-specific fields are inside `event.data`. Use the [complete field reference](/api-reference/webhook-events) and [downloadable examples](/webhooks/examples.json) to map each event to your order model. For engine payment events, `payment_id` is the link UUID and `link_id` is an `INV-...` display reference; refund events use the dispute UUID as `payment_id`. Partial/overpayment amounts are display token units, while success/failure engine events use the invoice denomination. Metadata is not present on every event.

Return HTTP `2xx` after storing or durably enqueueing the verified event. Failed deliveries retry with configurable exponential backoff and jitter. Apply updates idempotently using the business resource and transition in `data`: `id` is generated for each delivery attempt, and `event_id` identifies the notification event definition rather than an individual payment.

Use the dashboard's webhook activity view to inspect attempt status, request payloads, and responses. See [Testing Webhooks](/get-started/webhooks#testing-webhooks) for local setup.
