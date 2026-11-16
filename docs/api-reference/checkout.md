---
title: Public Payment Checkout
description: Discover payment options, create quotes, and poll payment state without merchant credentials.
---

# Public Payment Checkout

These endpoints serve the customer's pay screen. They do not require merchant API keys or signatures. All paths below are relative to `/api/v1`, and `:id` is the payment link UUID returned by the Merchant API.

Engine checkout routes are mounted only when engine checkout is enabled and configured. They serve engine-backed links; ordinary legacy links return `404`. An active, payable invoice link may have its engine order attached on first access.

## Checkout flow

1. Create a payment link on your server through the [Merchant Payments API](/api-reference/payments).
2. Open the returned `payment_url`, or build a pay screen using the endpoints below.
3. Load `options` and let the customer select a chain and token from that response.
4. Request a `quote`. Display its `deposit`, `pay_amount`, and expiry exactly as returned.
5. Poll `state` for observed funds, confirmation progress, and status. Use [webhooks](/get-started/webhooks) for server-side order updates.

## Get payment options

**GET** `/public/payments/engine/links/:id/options`

Unwrapped response:

```json
{
  "link_id": "22222222-2222-2222-2222-222222222222",
  "locked": false,
  "note": "",
  "currencies": ["USD"],
  "chains": [
    {
      "chain_id": 1,
      "family": "evm",
      "tokens": [
        {
          "token": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
          "symbol": "USDC",
          "decimals": 6,
          "currencies": ["USD"]
        }
      ]
    }
  ]
}
```

The example illustrates the shape; use the response for your link. When `locked` is true, offer only the returned pair. Funding or a terminal order can prevent chain/token switching. `note` provides additional context.

## Select or refresh a quote

**POST** `/public/payments/engine/links/:id/quote`

```json
{
  "chain_id": 1,
  "token": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `chain_id` | Yes | Non-zero chain ID from options |
| `token` | One of `token` or `asset` | Token contract/address from options |
| `asset` | One of `token` or `asset` | Asset identifier for an asset-based quote, where supported |

Provide exactly one of `token` and `asset`. Missing or both fields return `400`. The payment link must be active; inactive links return `409`. Future starts and quote/state conflicts can also return `409`.

The response uses the same pay-screen fields as `state` below. Refresh expired quotes before presenting payment instructions. Do not recompute `pay_amount` from prices or fees.

## Poll payment state

**GET** `/public/payments/engine/links/:id/state`

Unwrapped response, also used by `quote`:

```json
{
  "link_id": "22222222-2222-2222-2222-222222222222",
  "status": "quoted",
  "chain_id": 1,
  "token": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "currency": "USD",
  "pay_amount": "100500000",
  "deposit": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3",
  "quote_expiry": "2026-11-16T12:05:00Z",
  "expiry": "2026-11-16T12:15:00Z",
  "observed": "0",
  "confirmations": 0,
  "required_confirmations": 0
}
```

| Field | Description |
|-------|-------------|
| `status` | Engine order status, distinct from the merchant link's `payment_status` |
| `pay_amount` | Amount to send, as an integer decimal string in token base units |
| `deposit` | Address for this quote's chain family |
| `observed` | Observed amount in token base units; Bitcoin counts confirmed funds here |
| `quote_expiry` | Quote validity time; request a fresh quote after expiry |
| `expiry` | Engine order expiry |
| `payment_tx` | Optional funding transaction hash |
| `simulated` | Optional flag, emitted when true |
| `observed_latest` | Optional Bitcoin amount including unconfirmed/mempool funds, in satoshis |
| `confirmations` | Confirmation depth; emitted even when zero |
| `required_confirmations` | Required depth; emitted even when zero |

Keep amounts as strings or arbitrary-precision integers. Format them for display using the token's catalog decimals. Never send to a deposit address from a different chain or reuse stale quote instructions.

### Bitcoin confirmations

For a Bitcoin order in `funded_pending`, `observed` can remain `"0"` while `observed_latest` shows the mempool payment. Render a detected/confirming state using `confirmations` and `required_confirmations`; zero confirmations is valid. Wait for the backend's confirmed state or success webhook before fulfilling the order. Use returned thresholds rather than hard-coding them.

## Errors and rate limits

| HTTP | Meaning |
|------|---------|
| `400` | Invalid UUID, malformed body, missing chain, or invalid token/asset choice |
| `404` | Missing/deleted link, ordinary legacy link, or engine routes not enabled |
| `409` | Inactive/not-started link or an order/quote conflict |
| `429` | Route rate limit exceeded |
| `502` | Engine unavailable or an untyped upstream failure |

Typed upstream errors retain their HTTP status and return `{"error": "...", "code": "..."}`. Preserve string error codes when handling quote conflicts. Other errors may follow the deployment's global error handler format.

Options/state use the default limiter and quote uses the payment limiter, currently 100 requests per minute in this backend checkout. Poll within those limits and back off on `429`.

## Existing public payment-link routes

`GET /public/payments/links/:id` returns payer-facing link details and `GET /public/payments/links/:id/validate` validates a link. These are separate from the engine quote/state response above. Existing legacy checkout integrations also have quotation, payer, history, and payer-poll routes; do not substitute their payloads for engine checkout payloads.

## Hosted checkout compatibility API

The hosted pay page also uses the existing public payment-link API. These responses have different field names and units from the direct engine `options`/`quote`/`state` API above.

| Method | Path | Contract |
|--------|------|----------|
| `GET` | `/public/payments/links/:id` | Unwrapped payment link object; `checkout` is `engine` or `legacy` |
| `GET` | `/public/payments/links/:id/validate` | Unwrapped validation object with availability and optional live engine fields |
| `POST` | `/public/payments/payers/` | Register payer; returns unwrapped payer object with HTTP `201` |
| `GET` | `/public/payments/links/tokens` | Unwrapped `networks` and `tokens` catalog |
| `POST` | `/public/payments/links/quotation` | Unwrapped compatibility quotation |
| `GET` | `/public/payments/links/:id/:payerid/poll` | Unwrapped payer-specific payment state |

The payer-poll URL includes **both UUIDs**. Older Swagger annotations omit `:payerid`; follow the registered URL above. The complete [field contracts](/api-reference/data-models#payer-checkout) and [route inventory](/api-reference/public-api-routes) include the remaining legacy history, dispute, and development-helper routes.

### Payment link and payer data

The public payment link object uses `name` and `payment_link`, while the merchant create response uses `payment_name` and `payment_url`. Use `checkout` to choose the pay flow; `source` records provenance and does not identify engine backing. `receipt_number` is optional. Public details can include merchant branding, customer/product/cart data, payers, transactions, and quote data; see [PaymentLinkResponse](/api-reference/data-models#paymentlinkresponse) for the exact field names.

Register a payer before using the compatibility quotation/poll routes:

```json
{
  "name": "Alex Customer",
  "email": "customer@example.com",
  "payment_link_id": "22222222-2222-2222-2222-222222222222"
}
```

Optional `country` and `phone` are accepted. The returned payer `id` is used as `payer_id` in quotation requests and `:payerid` in poll URLs. Invalid, inactive, not-started, expired, or unavailable links can reject payer registration.

### Compatibility quotation

**POST** `/public/payments/links/quotation`

```json
{
  "paymentlinkId": "22222222-2222-2222-2222-222222222222",
  "payer_id": "33333333-3333-3333-3333-333333333333",
  "chainId": "1",
  "srctoken": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "currency": "USD",
  "network": "ethereum",
  "decimals": 6
}
```

Use the selected network/token's actual metadata. `paymentlinkId` and `payer_id` must parse as UUIDs; `chainId` is a **string**. `decimals` is a JSON integer. The shared DTO also accepts `currency_id` and `payment_type`. The link's stored currency determines conversion; it is not replaced by an arbitrary client amount. This endpoint checks start, expiry, active state, and usage before quoting.

For an engine-backed link, the compatibility service uses the engine deposit and pricing. It does not create a legacy wallet/quotation row. Example engine-backed response:

```json
{
  "success": true,
  "status": 200,
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3",
  "tokenAmount": 102.606015,
  "tokenAmountWithoutFee": 102.606015,
  "feePercentage": 0,
  "feeAmountToken": 0,
  "expiryTime": 1794830700,
  "paymentexchangeRate": 0.974601733,
  "tokenaddress": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "chainId": "1",
  "hasTransactions": false,
  "totalAmountReceived": 0,
  "amountRemaining": 102.606015,
  "isOverpaid": false,
  "breakdown": {
    "gross_amount": "100020004",
    "insurance_amount": "1928847",
    "fee_amount": "102051",
    "fee_fixed_amount": "510050",
    "gas_amount": "45063",
    "pay_amount": "102606015",
    "fee_bps": 10,
    "taker_fee_bps": 40,
    "safety_margin_bps": 150,
    "raw_price": "0.99980000",
    "final_price": "0.97990400",
    "venue": "kraken",
    "gas_side": "payer",
    "gas_native_wei": "17812500000000",
    "gas_rate": "1020100/415000000000000"
  },
  "engine_quote": {
    "raw_price": "0.99980000",
    "final_price": "0.97990400",
    "venue": "kraken",
    "taker_fee_bps": 40,
    "safety_margin_bps": 150,
    "fee_bps": 10,
    "gross_amount": "100020004",
    "insurance_amount": "1928847",
    "fee_amount": "102051",
    "fee_fixed_amount": "510050",
    "gas_amount": "45063",
    "pay_amount": "102606015"
  }
}
```

Values above illustrate the contract. Use the returned quote for payment instructions. `expiryTime` is Unix seconds. Top-level `tokenAmount`/`totalAmountReceived`/`amountRemaining` are **display numbers**, while `breakdown` and `engine_quote` monetary amounts are **token base-unit strings**. The direct engine API above keeps its amount strings in base units.

### Fee and gas breakdown

`breakdown` is optional and appears only when a live engine quote is available. It is also included in compatibility validation/poll responses when the live engine state has pricing. The six component/total amounts are strings:

```text
gross_amount + insurance_amount + fee_amount + fee_fixed_amount + gas_amount = pay_amount
```

`gross_amount` is the fee-exclusive base. `fee_bps` applies to `fee_amount` alone; it does not represent the effective total markup after insurance, flat fee, and gas. `taker_fee_bps` and `safety_margin_bps` describe the price composition. `raw_price`, `final_price`, and `venue` expose pricing context. `gas_side` indicates who bears gas; `gas_native_wei` and the rational `gas_rate` string provide order-level context. Preserve these strings and use token decimals for display. Use the quoted total rather than recalculating payment instructions.

`engine_quote` is the engine's original quote JSON object passed through verbatim, including additional upstream fields. It is an object, not a base64 string, and is omitted when no engine quote block exists. Order-level gas context is added to the mapped `breakdown` and is not guaranteed to be present in the raw quote object. The backend saves a best-effort quote snapshot for audit when quoting; it does not return that snapshot as proof that a quote is still live.

On engine-backed responses, legacy `feePercentage` and `feeAmountToken` are zero, and `tokenAmountWithoutFee` equals the all-in `tokenAmount`. Use `breakdown.gross_amount` for the true fee-exclusive base. On the legacy pricing path, `breakdown` and `engine_quote` are omitted and the current flat processing fee is represented in the legacy top-level fee fields.

### Validation, polling, and confirmations

Compatibility validation exposes `id`, `is_valid`, `is_expired`, `is_available`, `is_overpaid`, `payment_status`, timing/usage/amount fields, and `message`. Its network/token identity fields are `network`, `chain_id`, and `token_address`.

The payer poll exposes availability, expected/received/remaining amounts, `is_overpaid`, `payment_status`, usage/time remaining, optional disputes and redirects, `order_id`, and `auto_fill`. Its network/token fields are spelled `chainid` and `tokenaddress`.

For engine-backed links, both responses can additionally contain `engine_status`, `payment_tx`, `unconfirmed_amount_received`, `confirmations`, `required_confirmations`, and `breakdown`. Validation can also include live `expected_amount`, `total_amount_received`, `amount_remaining`, and `excess_amount`. These are optional when the link is legacy or live state is unavailable. Confirmation counters can be present with a value of zero.

For Bitcoin, `unconfirmed_amount_received` is a display BTC number rather than the direct engine API's `observed_latest` satoshi string. Confirmed received amounts can stay zero while the transaction is detected in the mempool. Show confirmation progress using the returned counters and wait for confirmed backend status before fulfillment.
