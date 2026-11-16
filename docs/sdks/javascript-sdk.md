---
title: JavaScript / TypeScript SDK
description: Use BitxpayClient for signed server-side payment and subscription requests.
---

# JavaScript / TypeScript SDK

The server-side `@bitxpay/sdk` implementation in `bitxpay-api/sdks/typescript` provides payment links, merchant subscriptions, pagination, and webhook verification. It requires **Node.js 18+** and uses built-in `fetch` and `node:crypto`.

## Installation

```bash
npm install @bitxpay/sdk
```

For a repository checkout, build the package from `bitxpay-api/sdks/typescript` with `npm install` and `npm run build`.

## Create a client

```typescript
import { BitxpayClient } from '@bitxpay/sdk';

const client = new BitxpayClient({
  apiKey: process.env.BITXPAY_API_KEY!,
  privateKey: process.env.BITXPAY_PRIVATE_KEY!,
  environment: 'sandbox',
});
```

Keep the private key on your server. Supply the dashboard-issued `Ed25519:<base64 PKCS#8 DER>` value. The SDK signs `METHOD + PATH + TIMESTAMP + BODY`, includes `/api/v1` in the signed path, and sends `X-API-Key`, `X-API-Signature`, and `X-API-Timestamp`.

| Option | Default | Description |
|--------|---------|-------------|
| `apiKey` | Required | Merchant API key |
| `privateKey` | Required | Dashboard-issued Ed25519 private key |
| `environment` | `sandbox` | `sandbox` or `production` |
| `baseUrl` | Environment host | Override the host, without `/api/v1` (resource paths include it) |
| `timeoutMs` | `30000` | Request timeout in milliseconds |
| `maxRetries` | `2` | Transient failure retries |
| `defaultHeaders` | `{}` | Extra headers |
| `fetch` | Global `fetch` | Custom fetch implementation |

## Payments

```typescript
const link = await client.payments.create({
  payment_name: 'Order #1234',
  amount: 49.99,
  currency: 'USD',
  customer_email: 'customer@example.com',
  success_url: 'https://example.com/thanks',
  is_test: true,
});

console.log(link.id, link.payment_status);
const current = await client.payments.get(link.id);
await client.payments.updateStatus(link.id, 'deactivate');
const currencies = await client.payments.listCurrencies();
```

The REST response uses `payment_url` and `payment_name`. Currency discovery returns `id`, `code`, and `name`; the current SDK `Currency` type still describes a broader object with `symbol`. The bundled TypeScript `PaymentLink` interface still names these `payment_link` and `name`; use a raw request for an accurately typed checkout URL:

```typescript
const created = await client.http.requestData<{
  id: string;
  payment_url: string;
  payment_status: string;
}>({
  method: 'POST',
  path: '/api/v1/payment_links',
  body: { payment_name: 'Order #1235', amount: 49.99, currency: 'USD', is_test: true },
});
console.log(created.payment_url);
```

The current SDK action type lists `activate`, `deactivate`, and `expire`. `deactivate` and `expire` work with the mounted API; `activate` currently fails in the service. See [Payment Link Status](/api-reference/payments#_6-update-payment-link-status).

## Pagination

```typescript
const page = await client.payments.list({ page: 1, page_size: 20, currency: 'USD' });
console.log(page.data, page.page, page.pageSize, page.totalItems, page.totalPages, page.hasMore);
```

The SDK maps payment `page_size` to the REST API's `limit`. Subscription lists use `page_size` directly. List filters are documented in the [Payments](/api-reference/payments) and [Subscriptions](/api-reference/subscriptions) references.

## Merchant subscriptions

| SDK method | REST path (under `/api/v1`) |
|------------|---------------------------|
| `subscriptions.createPlan`, `listPlans` | `/merchant/subscription_plans` |
| `subscriptions.getPlan`, `updatePlan` | `/merchant/subscription_plans/:id` |
| `subscriptions.createSubscriber`, `listSubscribers` | `/merchant/subscribers` |
| `subscriptions.getSubscriber`, `updateSubscriber` | `/merchant/subscribers/:id` |
| `subscriptions.listInvitations` | `/merchant/subscribers/invitations` |
| `subscriptions.listLinks`, `getLink` | `/merchant/subscription_links`, `/merchant/subscription_links/:id` |

`listSubscribers({ plan_id })` uses `/merchant/subscribers/plan/:plan_id`, which returns all matches in a `subscribers` list object without populated pagination fields.

The bundled SDK's create-plan types describe an older payload. Use the current [create-plan request](/api-reference/subscriptions#_1-create-subscription-plan), including `merchant`, `destination`, `token`, `amount`, `interval`, `max_arrears`, `plan_nonce`, `merchant_sig`, and `name`, through `client.http.requestData` when needed. Create-subscriber returns `{ subscriber, subscription_link }` inside `data`; it does not return a bare subscriber DTO.

## Webhook verification

```typescript
import { constructWebhookEvent, WebhookSignatureError } from '@bitxpay/sdk';

// rawBody is the unparsed body string; headers are the incoming HTTP headers.
try {
  const event = constructWebhookEvent(rawBody, headers, process.env.WEBHOOK_SECRET!);
  console.log(event.event_type, event.data);
} catch (error) {
  if (error instanceof WebhookSignatureError) {
    // Reject the delivery with a non-2xx response.
  } else {
    throw error;
  }
}
```

The header is `X-Webhook-Signature: sha256=<hex>`. See [Webhooks](/get-started/webhooks) for complete Express/Flask examples and duplicate handling. Use the [exact event data reference](/api-reference/webhook-events) when reading `event.data`; metadata, IDs, and amount units vary by event. [Download example deliveries](/webhooks/examples.json) for each supported code.

## Errors

The SDK throws `BitxpayAPIError` subclasses for HTTP failures. Inspect `status`, optional string `code`, and `body`:

```typescript
import { BitxpayAPIError } from '@bitxpay/sdk';

try {
  await client.payments.get('22222222-2222-2222-2222-222222222222');
} catch (error) {
  if (error instanceof BitxpayAPIError) {
    console.error(error.status, error.code, error.body);
  } else {
    throw error;
  }
}
```

The SDK also exports configuration, connection, and webhook signature errors. Transient retries use backoff and honor `Retry-After`. An ambiguous timeout after creation can leave an existing link; reconcile before creating another.

## Current coverage

The bundled SDK covers payment links and merchant subscriptions. Use REST or the raw HTTP client for the checkout catalog and public checkout flow. Webhook management requires a dashboard session. See [SDKs & Libraries](/sdks/) for Python and PHP packages.
