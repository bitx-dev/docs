# Webhooks

BITXpay delivers subscribed events to your webhook URL using HTTP POST. Set up a publicly reachable HTTPS endpoint, then configure its URL, secret, and active event subscriptions in your dashboard.

## Event types

The backend defines these payment and subscription event codes. Discover the active event IDs in your environment through the dashboard or `GET /webhooks/events` using your dashboard session.

| Event type | Meaning |
|------------|---------|
| `payment_link.created` | Payment link created |
| `payment.succeeded` | Payment received successfully |
| `payment.partial_succeeded` | Partial payment received |
| `transaction.overpaid` | Overpayment received |
| `payment.failed` | Payment failed |
| `payment.expired` | Payment link expired |
| `refund.initiated` | Refund requested |
| `refund.succeeded` | Refund completed |
| `subscription_plan.created` | Subscription plan created |
| `subscription_invitation.created` | Subscription invitation created |
| `subscription.created` | Subscription created |
| `subscription.renewed` | Subscription renewed |
| `subscription.renewal_failed` | Subscription renewal failed |

Availability depends on the active event catalog, enabled subscriptions, and the operation that produces the event. See [Webhook Event Data](/api-reference/webhook-events) for every field, omission rule, and producer-specific example. Some defined subscription events have no automatic producer in this checkout.

## Webhook payload structure

```json
{
  "id": "558e008e-a31c-4fe8-8c81-284ece730cdf",
  "event_type": "payment.succeeded",
  "event_id": "3f01958c-8f10-4982-87f9-c129f60531b5",
  "timestamp": "2026-11-16T12:00:00Z",
  "data": {
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
}
```

This example shows the common envelope. `data` contains the original event-specific payload, including `event_code` and any fields emitted for that event. `webhook_metadata` is declared only for `payment_link.created`, `subscription.created`, and `subscription_invitation.created`. It is not automatically copied into payment success, partial payment, overpayment, expiry, or refund events. [See all payloads](/api-reference/webhook-events).

| Field | Description |
|-------|-------------|
| `id` | Delivery identifier, newly generated on each attempt |
| `event_type` | Event code; use this to choose your handler |
| `event_id` | Notification event definition ID |
| `timestamp` | Delivery time in RFC 3339 format |
| `data` | Event-specific data |

## Verifying webhook signatures

Deliveries with a configured secret include:

```http
Content-Type: application/json
X-Webhook-Signature: sha256=<64 lowercase hexadecimal characters>
X-Webhook-Timestamp: <Unix time in seconds>
X-Webhook-Event: payment.succeeded
```

`X-Webhook-Event` is included when the event definition is loaded. Authenticate the body using `X-Webhook-Signature`, then read the signed `event_type` field. Compute HMAC-SHA256 over the **raw request body bytes** using your webhook secret. The signature has a literal `sha256=` prefix. The timestamp header is separate from the HMAC input; the body's `timestamp` is covered by the signature.

::: code-group

<<< @/snippets/webhook.mjs{javascript} [Express.js]

<<< @/snippets/webhook.py{python} [Flask]

:::

Configure a secret and reject missing or invalid signatures. Parse JSON after verification. See [Integration Webhooks](/integration/webhooks) for handling guidance.

## Retries and duplicate handling

HTTP `200`–`299` acknowledges delivery. Connection failures, timeouts, and other status codes cause retries until the configured attempt limit is reached. The backend defaults to five total attempts and a 10-second request timeout. With the default 1-second initial delay and 2× multiplier, retries are scheduled approximately 2, 4, 8, and 16 seconds after failed attempts, with ±10% jitter. Scheduling/worker load can delay actual delivery. The delay is capped at one hour before jitter, and all these settings are configurable.

Store or durably enqueue the verified event before returning `2xx`. Deduplicate business changes by the resource and transition in `data`, such as a payment/transaction reference plus the event type. Do not use only `id` (it changes on retries) or `event_id` (shared by all deliveries of an event type). Do not assume delivery order.

## Webhook management

Webhook management uses your authenticated **dashboard session**, rather than merchant API-key signatures. All paths below are relative to `/api/v1`. Use the dashboard for setup when integrating the Merchant API.

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/webhooks/events` | Discover active event definitions and IDs |
| `POST` | `/webhooks/` | Register a webhook |
| `GET` | `/webhooks/` | List webhooks |
| `GET` | `/webhooks/:id` | Retrieve a webhook |
| `PUT` | `/webhooks/:id` | Update URL, secret, status, or subscriptions |
| `DELETE` | `/webhooks/:id` | Remove a webhook |
| `GET` | `/webhooks/activity` | Inspect delivery activity |
| `GET` | `/webhooks/poll` | Poll delivery events |
| `POST` | `/webhooks/regenerate-secret` | Regenerate the shared secret |
| `POST` | `/webhooks/validate-secret` | Validate the shared secret |
| `POST` | `/webhooks/subscriptions/update` | Toggle existing subscriptions |
| `POST` | `/webhooks/notifications/register` | Register a test event |
| `POST` | `/webhooks/notifications/acknowledge` | Acknowledge a job for testing |

Registration body:

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

Use actual event IDs from `/webhooks/events`. An omitted `is_active` defaults to false. Omitting subscriptions creates inactive subscriptions to the active catalog, so enable the desired events explicitly. The first webhook gets a generated shared secret; later webhooks reuse it. See [Webhook Management](/api-reference/webhooks) for complete request/response contracts, shared-secret behavior, and polling.

## Testing webhooks

Use the [authenticated test-notification API](/api-reference/webhooks#register-a-test-event) to send any supported event with its exact payload. Run one of the sample handlers locally and expose port 3000 through your development tunnel. Configure the resulting HTTPS URL in the dashboard. Trigger an enabled payment/subscription event and inspect its delivery activity. A temporary webhook inspection URL can also help inspect payloads, but use a handler with signature verification for your integration.

If delivery fails, check public reachability, your configured secret, the raw-body parser, the `sha256=` prefix, and the HTTP response code. Inspect request and response details in the dashboard's activity view.
