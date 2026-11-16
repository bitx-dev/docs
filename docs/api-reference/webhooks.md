---
title: Webhook Management
description: Configure endpoints, shared secrets, subscriptions, delivery activity, polling, and test events.
---

# Webhook Management

These endpoints use your authenticated dashboard session and are relative to `/api/v1`. A merchant API key with a request signature does not replace that session. Use the dashboard to configure merchant integrations, or call this API from an authorized dashboard client.

For deliveries to your own server, see [Webhooks](/get-started/webhooks) and the exact [event data reference](/api-reference/webhook-events). Webhook management responses generally wrap the result in `data`; creation also includes a top-level `message` and returns HTTP `201`.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/webhooks/events` | List active event definitions |
| `POST` | `/webhooks/` | Create an endpoint |
| `GET` | `/webhooks/` | List endpoints |
| `GET` | `/webhooks/:id` | Get endpoint and subscriptions |
| `PUT` | `/webhooks/:id` | Update URL, active flag, or event subscriptions |
| `DELETE` | `/webhooks/:id` | Delete endpoint |
| `POST` | `/webhooks/regenerate-secret` | Regenerate the merchant's shared secret |
| `POST` | `/webhooks/validate-secret` | Check the current shared secret |
| `POST` | `/webhooks/subscriptions/update` | Toggle existing event subscriptions |
| `GET` | `/webhooks/activity` | Inspect jobs and delivery attempts |
| `GET` | `/webhooks/poll` | Poll delivery attempts |
| `POST` | `/webhooks/notifications/register` | Register a test notification |
| `POST` | `/webhooks/notifications/acknowledge` | Simulate a job acknowledgement for testing |

The registered bulk-update path is `/webhooks/subscriptions/update`; older Swagger comments name a different path. The method/path inventory is also available in the generated [route reference](/api-reference/public-api-routes).

## Discover event IDs

**GET** `/webhooks/events`

Response:

```json
{
  "data": {
    "events": [
      {
        "id": "3f01958c-8f10-4982-87f9-c129f60531b5",
        "code": "payment.succeeded",
        "description": "Payment received successfully",
        "source": "payment",
        "is_active": true,
        "created_at": "2026-11-16T12:00:00Z"
      }
    ],
    "total": 1
  }
}
```

Use IDs returned by your environment when subscribing. This example illustrates one entry; the active catalog is database-driven. A defined event code does not guarantee an automatic producer for every operation; see the event-specific notes.

## Create an endpoint

**POST** `/webhooks/`

```json
{
  "url": "https://example.com/webhook",
  "event_subscriptions": [
    {
      "id": "3f01958c-8f10-4982-87f9-c129f60531b5",
      "is_active": true
    }
  ]
}
```

`url` is required. Optional `secret` is accepted for the first webhook and must be at least 32 characters when non-empty; otherwise a 32-byte random secret is generated as 64 hexadecimal characters. Later webhooks reuse the first webhook's secret and ignore a supplied replacement.

The endpoint is created active. Omitting `event_subscriptions` creates subscriptions for all active events with each subscription **inactive**. Omitting an item's `is_active` also makes it false. Enable the desired event subscriptions explicitly.

The `data` result includes `id`, `url`, `secret`, `is_active`, `event_subscriptions`, `created_at`, and optional `updated_at`. Each subscription has `id` (subscription UUID), `event_id` (event definition UUID), `is_active`, `created_at`, and optional `event` details.

## List, retrieve, and update

**GET** `/webhooks/` accepts `page` (default 1) and `page_size` (default 10, maximum 100). The result in `data` contains `webhooks`, `total`, `page`, `page_size`, `total_pages`, and optional `shared_secret`. List items omit individual secrets and subscription details. **GET** `/webhooks/:id` returns the endpoint with subscriptions, without the secret.

**PUT** `/webhooks/:id` accepts:

```json
{
  "url": "https://example.com/new-webhook",
  "is_active": true,
  "event_subscriptions": [
    {
      "id": "3f01958c-8f10-4982-87f9-c129f60531b5",
      "is_active": false
    }
  ]
}
```

Fields are optional. Here each `id` is an **event definition ID**. Supplied entries update or create those event subscriptions; unmentioned subscriptions retain their status. Inactive or missing event definitions are skipped. The legacy `event_ids` array is still accepted when `event_subscriptions` is not used; it replaces existing subscriptions and enables its valid events.

`secret` exists in the shared update DTO but is ignored by the service. Use the shared-secret regeneration endpoint instead.

**DELETE** `/webhooks/:id` returns `{"data":{"success":true,"deleted_id":"..."}}`.

## Shared secret lifecycle

**POST** `/webhooks/regenerate-secret` has no body. It replaces the shared secret across the merchant's existing endpoints. Its `data` result contains `success`, `secret`, and `message`. Update verification configuration for every receiving endpoint after rotation. At least one webhook must exist.

**POST** `/webhooks/validate-secret` takes `{"secret":"..."}` and returns `data.valid` plus `data.message`. The list endpoint exposes the shared secret as `data.shared_secret`; a single-endpoint GET does not expose it.

The delivery worker reads the endpoint's current secret on each attempt. Retries after rotation therefore use the new secret.

## Toggle existing subscriptions

**POST** `/webhooks/subscriptions/update`

```json
{
  "webhook_id": "77777777-7777-7777-7777-777777777777",
  "subscriptions": [
    {
      "id": "88888888-8888-8888-8888-888888888888",
      "is_active": true
    }
  ]
}
```

Here `subscriptions[].id` is an **existing webhook subscription ID**, unlike `event_subscriptions[].id` in create/update, which is an event definition ID. At least one item is required. The result includes `success`, `message`, `updated_count`, and `updated_items` inside `data`.

## Activity and polling

**GET** `/webhooks/activity` accepts optional `webhook_id`, `page` (default 1), and `page_size` (default 20, maximum 100). Its `data` contains `activities`, `total`, `page`, `page_size`, and `total_pages`.

Activity entries describe the notification job: `id`, `webhook_id`, `webhook_url`, `event_type`, `action`, `description`, `status`, `attempts`, optional `last_attempt_at`, `scheduled_at`, optional `payload`, optional `delivery_attempts`, and `created_at`. Attempts include `id`, `attempt_number`, optional `http_status`, `success`, optional `error_message`, optional `request_payload`/`response_payload`, and `created_at`. A recorded request payload is the original event data, not the signed outbound HTTP body.

**GET** `/webhooks/poll` accepts:

| Parameter | Default | Behavior |
|-----------|---------|----------|
| `since` | Omitted | RFC 3339 time; takes precedence over `minutes` |
| `minutes` | 5 | Look-back window; maximum 1440 |
| `limit` | 50 | Number of returned attempts; valid range 1–100 |

The result is in `data`:

```json
{
  "data": {
    "has_new_events": false,
    "events": [],
    "count": 0,
    "polling_info": {
      "next_poll_after": "2026-11-16T12:00:03Z",
      "recommended_wait_ms": 3000
    }
  }
}
```

The array is `events`, not `new_events`. When present, `latest_at` is the newest returned attempt time. Each item includes `attempt_id`, `webhook_id`, `webhook_url`, `status` (`success` or `failed`), `attempt_number`, optional `http_status`/`error_message`, `payload`, `sent_at`, and optional `response_body`.

`payload` has the familiar `id`, `event_type`, `event_id`, `timestamp`, and `data` shape, but is reconstructed from stored attempt data. Its generated `id` and timestamp are not an exact copy of the original signed HTTP delivery. Use `attempt_id` when tracking polling results; use business references for order updates. Poll results cannot be used to reconstruct or verify the original HMAC signature.

## Register a test event

**POST** `/webhooks/notifications/register`

Use the event's **data object** as `payload`, rather than nesting a complete delivery envelope:

```json
{
  "event_code": "payment.succeeded",
  "channels": ["webhook"],
  "payload": {
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
}
```

The controller inserts `payload.event_code` when absent. Keep it consistent with the top-level code. Parsing through the event DTO discards unknown fields and preserves the event's declared fields and defaults. Payload validation runs before registering jobs. Selecting `webhook` still requires an active endpoint and an active subscription for that event; inspect the returned `data.job_ids.webhook` array.

The result contains `success`, `message`, `event_code`, `triggered_channels`, and `job_ids` in `data`. Channels can be `email`, `webhook`, and `desktop`. Omitting channels selects all three. Use `channels: ["webhook"]` when testing webhook delivery alone.

**POST** `/webhooks/notifications/acknowledge` takes `job_id` (notification job UUID), `status_code` (200–599), and optional `response`. It is a testing operation that changes job delivery state; your real receiving server acknowledges a delivery by returning HTTP `2xx` to the actual POST.

## Separate incoming receiver

`POST /webhooks/incoming` is BITXpay's own public incoming receiver, configured with a separate application secret. It is not the URL used to register or subscribe your endpoint, and it is separate from engine callbacks under `/api/v2`. Register your own receiving URL through `/webhooks/` to receive merchant notification deliveries.
