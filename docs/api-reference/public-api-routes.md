---
title: Public API Route Inventory
description: Source-derived routes and authentication boundaries for BITXpay integrations.
---

# Public API Route Inventory

This inventory is generated from route registrations in the backend checkout. All paths include the actual `/api/v1` prefix. It covers merchant payments/subscriptions, public checkout and metadata, webhook management, and the API-key mass-payout group. Dashboard wallet/authentication, admin, and engine-to-BITXpay infrastructure callbacks are separate surfaces.

For payloads use [Payments](/api-reference/payments), [Checkout](/api-reference/checkout), [Subscriptions](/api-reference/subscriptions), [Webhook Event Data](/api-reference/webhook-events), and [Webhook Management](/api-reference/webhooks). A registered route does not imply every deployment enables its downstream services.

Mass payouts are registered after global dashboard authentication in `internal/routes/routes.go`; their local merchant-key middleware does not remove that parent authentication requirement. The `/mass_payouts` group is therefore not a working API-key-only entry point in this checkout. Localchain routes are development helpers. Contact/assets routes are included to make the inventory complete; they are not merchant payment-link CRUD.

## Merchant payment links

Authentication: Merchant API key + signature. Source: `internal/payments/route/merchant_payment_routes.go` (`SetupMerchantPaymentRoutes`).

| Method | Path |
|--------|------|
| `GET` | `/api/v1/payment_links/currencies` |
| `GET` | `/api/v1/payment_links/catalog` |
| `POST` | `/api/v1/payment_links/` |
| `GET` | `/api/v1/payment_links/` |
| `GET` | `/api/v1/payment_links/:id` |
| `PUT` | `/api/v1/payment_links/:id/status` |
| `DELETE` | `/api/v1/payment_links/:id` |

## Merchant subscriptions

Authentication: Merchant API key + signature. Source: `internal/subscription/route/merchant_route.go` (`SetupMerchantSubscriptionRoutes`).

| Method | Path |
|--------|------|
| `POST` | `/api/v1/merchant/subscription_plans/` |
| `GET` | `/api/v1/merchant/subscription_plans/` |
| `GET` | `/api/v1/merchant/subscription_plans/:id` |
| `PUT` | `/api/v1/merchant/subscription_plans/:id` |
| `POST` | `/api/v1/merchant/subscribers/` |
| `GET` | `/api/v1/merchant/subscribers/` |
| `GET` | `/api/v1/merchant/subscribers/invitations` |
| `GET` | `/api/v1/merchant/subscribers/plan/:plan_id` |
| `GET` | `/api/v1/merchant/subscribers/:id` |
| `PUT` | `/api/v1/merchant/subscribers/:id` |
| `GET` | `/api/v1/merchant/subscription_links/` |
| `GET` | `/api/v1/merchant/subscription_links/:id` |

## Public engine checkout

Authentication: None; mounted only when engine checkout is ready. Source: `internal/payments_engine/route/checkout_routes.go` (`SetupEnginePublicRoutes`).

| Method | Path |
|--------|------|
| `GET` | `/api/v1/public/payments/engine/links/:id/options` |
| `POST` | `/api/v1/public/payments/engine/links/:id/quote` |
| `GET` | `/api/v1/public/payments/engine/links/:id/state` |

## Public payment links and legacy checkout

Authentication: None. Source: `internal/payments/route/payment_route.go` (`SetupPublicPaymentRoutes`).

| Method | Path |
|--------|------|
| `POST` | `/api/v1/public/payments/links/sendemail` |
| `POST` | `/api/v1/public/payments/links/quotation` |
| `GET` | `/api/v1/public/payments/links/tokens` |
| `POST` | `/api/v1/public/payments/links/history` |
| `PUT` | `/api/v1/public/payments/links/history/:id` |
| `GET` | `/api/v1/public/payments/links/:id/:payerid/poll` |
| `GET` | `/api/v1/public/payments/links/:id/validate` |
| `GET` | `/api/v1/public/payments/links/:id` |
| `POST` | `/api/v1/public/payments/payers/` |
| `GET` | `/api/v1/public/payments/disputes/:id` |
| `PUT` | `/api/v1/public/payments/disputes/:id/mark-payer-initiated` |
| `GET` | `/api/v1/public/payments/localchain/balance` |
| `POST` | `/api/v1/public/payments/localchain/fund-wallet` |
| `POST` | `/api/v1/public/payments/localchain/transfer` |
| `POST` | `/api/v1/public/payments/localchain/fund-eth` |

## Public subscriptions

Authentication: None. Source: `internal/subscription/route/subscription_route.go` (`SetupPublicSubscriptionRoutes`).

| Method | Path |
|--------|------|
| `GET` | `/api/v1/public/subscriptions/plans/` |
| `GET` | `/api/v1/public/subscriptions/plans/:id` |
| `GET` | `/api/v1/public/subscriber/prepare` |
| `GET` | `/api/v1/public/subscriber/:id` |
| `PUT` | `/api/v1/public/subscriber/:id` |
| `POST` | `/api/v1/public/subscriptions/link/` |
| `GET` | `/api/v1/public/subscriptions/link/:walletAddress` |
| `POST` | `/api/v1/public/subscriptions/link/payment` |
| `PUT` | `/api/v1/public/subscriptions/link/:id` |
| `GET` | `/api/v1/public/subscriptions/nft/:plan_id` |

## Network metadata

Authentication: None. Source: `internal/networks/route/route.go` (`SetupNetworkRoutes`).

| Method | Path |
|--------|------|
| `GET` | `/api/v1/networks/active` |
| `GET` | `/api/v1/get-networks` |
| `GET` | `/api/v1/get-network-currencies` |

## Assets

Authentication: None in route registration. Source: `internal/assets/route/route.go` (`SetupAssetRoutes`).

| Method | Path |
|--------|------|
| `GET` | `/api/v1/assets/crypto/list` |
| `GET` | `/api/v1/assets/fiat/list` |
| `POST` | `/api/v1/assets/crypto/updateToken` |

## Contact

Authentication: None in route registration. Source: `internal/contact/route/route.go` (`SetupContactRoutes`).

| Method | Path |
|--------|------|
| `POST` | `/api/v1/contact/` |
| `POST` | `/api/v1/contact/create` |
| `GET` | `/api/v1/contact/list` |
| `GET` | `/api/v1/contact/:id` |

## Webhook management

Authentication: Dashboard session. Source: `internal/notification/route/route.go` (`SetupWebhookRoutes`).

| Method | Path |
|--------|------|
| `GET` | `/api/v1/webhooks/events` |
| `POST` | `/api/v1/webhooks/` |
| `GET` | `/api/v1/webhooks/` |
| `GET` | `/api/v1/webhooks/activity` |
| `GET` | `/api/v1/webhooks/poll` |
| `GET` | `/api/v1/webhooks/:id` |
| `PUT` | `/api/v1/webhooks/:id` |
| `DELETE` | `/api/v1/webhooks/:id` |
| `POST` | `/api/v1/webhooks/regenerate-secret` |
| `POST` | `/api/v1/webhooks/validate-secret` |
| `POST` | `/api/v1/webhooks/subscriptions/update` |
| `POST` | `/api/v1/webhooks/notifications/register` |
| `POST` | `/api/v1/webhooks/notifications/acknowledge` |

## Incoming webhook receiver

Authentication: No dashboard session; receiver-specific secret handling. Source: `internal/notification/route/route.go` (`SetupPublicWebhookRoutes`).

| Method | Path |
|--------|------|
| `POST` | `/api/v1/webhooks/incoming` |

## Mass payouts

Authentication: Dashboard session followed by merchant API-key middleware in current route order. Source: `internal/mass_payouts/routes/routes.go` (`SetupMerchantMassPayoutRoutes`).

| Method | Path |
|--------|------|
| `POST` | `/api/v1/mass_payouts/` |
| `GET` | `/api/v1/mass_payouts/` |
| `GET` | `/api/v1/mass_payouts/:id` |
| `PUT` | `/api/v1/mass_payouts/:id` |
| `DELETE` | `/api/v1/mass_payouts/:id` |
| `PATCH` | `/api/v1/mass_payouts/:id/status` |
| `POST` | `/api/v1/mass_payouts/:id/process` |
| `POST` | `/api/v1/mass_payouts/:id/:batchId/execute` |
| `POST` | `/api/v1/mass_payouts/:batch_id/recipients` |
| `GET` | `/api/v1/mass_payouts/:batch_id/recipients` |
| `POST` | `/api/v1/mass_payouts/:batch_id/recipients/upload-csv` |
| `POST` | `/api/v1/mass_payouts/:batch_id/recipients/bulk` |
| `GET` | `/api/v1/mass_payouts/recipients/:id` |
| `PUT` | `/api/v1/mass_payouts/recipients/:id` |
| `DELETE` | `/api/v1/mass_payouts/recipients/:id` |

