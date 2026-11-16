import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Read the backend checkout rather than generated Swagger annotations.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.resolve(process.env.BITXPAY_API_DIR || path.join(root, '../bitxpay-api'));
const check = process.argv.includes('--check');
const read = (name) => fs.readFileSync(path.join(backend, name), 'utf8');
const setupSource = read('internal/routes/routes.go');
const authBoundary = setupSource.indexOf('api.Use(middlewares.AuthMiddleware(');
if (authBoundary < 0) throw new Error('Review the global authentication boundary.');
for (const name of ['SetupPublicPaymentRoutes', 'SetupMerchantPaymentRoutes', 'SetupPublicSubscriptionRoutes', 'SetupMerchantSubscriptionRoutes', 'SetupPublicWebhookRoutes', 'SetupNetworkRoutes', 'SetupAssetRoutes', 'SetupContactRoutes']) {
  const at = setupSource.indexOf('.' + name + '(');
  if (at < 0 || at > authBoundary) throw new Error('Review public authentication for ' + name);
}
for (const name of ['SetupWebhookRoutes', 'SetupMerchantMassPayoutRoutes']) {
  const at = setupSource.indexOf('.' + name + '(');
  if (at < 0 || at < authBoundary) throw new Error('Review dashboard authentication for ' + name);
}
const worker = read('internal/notification/service/notification_worker.go');
const envelopeBlock = worker.match(/webhookPayload := map\[string\]interface\{\}\{([\s\S]*?)\n\t\}/)?.[1];
const envelopeKeys = [...(envelopeBlock || '').matchAll(/"(\w+)"\s*:/g)].map(m => m[1]).sort();
if (JSON.stringify(envelopeKeys) !== JSON.stringify(['data', 'event_id', 'event_type', 'id', 'timestamp'])) {
  throw new Error('Review the webhook delivery envelope and schema.');
}
const payloadSource = read('internal/notification/dto/notification_payloads.go');
const eventSource = read('internal/model/notification_event.go');
const constants = new Map([...eventSource.matchAll(/(Event\w+)\s+TypeNotificationEvent\s*=\s*"([^"]+)"/g)].map(m => [m[1], m[2]]));
const parser = payloadSource.slice(payloadSource.indexOf('func ParseNotificationPayload'));
const events = [...parser.matchAll(/case model\.(\w+):\s*var p (\w+)/g)].map(m => ({ code: constants.get(m[1]), type: m[2] }));
if (events.length !== constants.size || events.some(e => !e.code)) throw new Error('Event constants and payload parser disagree; review the backend contract.');

function fieldsFor(name) {
  const body = payloadSource.match(new RegExp(`type ${name} struct \\{([\\s\\S]*?)\\n\\}`))?.[1];
  if (!body) throw new Error(`Missing payload struct: ${name}`);
  return body.split('\n').filter(line => line.trim() && !line.trim().startsWith('//')).map(line => {
    const m = line.match(/^\s*(\w+)\s+(\S+)\s+`json:"([^",]+)([^"]*)"`/);
    if (!m) throw new Error(`Unsupported field in ${name}: ${line}`);
    const type = ({ string: 'string', '*string': 'string', '*int': 'integer', int: 'integer', bool: 'boolean', 'map[string]interface{}': 'object' })[m[2]];
    if (!type) throw new Error(`Add serialization support for ${m[2]} in ${name}.`);
    return { goName: m[1], name: m[3], type, optional: m[4].includes('omitempty') };
  });
}

const linkID = '22222222-2222-2222-2222-222222222222';
const planID = '6f03697c-eb8d-49f2-9ac1-bca1cbe58a4c';
const subID = '5d17b0c4-b32c-40dd-a2e2-8ace612251c7';
const disputeID = '44444444-4444-4444-4444-444444444444';
const payURL = `https://pay.bitxpay.com/payment_link?payment_id=${linkID}`;
const time = '2026-11-16T12:00:00Z';
// Illustrative values and semantics are reviewed against the producer services.
const definitions = {
  event_code: ['Same event code as the outer event_type.', ''],
  customer_email: ['Notification recipient email; may be the latest payer, customer, or merchant depending on the producer.', 'customer@example.com'],
  customer_name: ['Notification recipient display name.', 'Alex Customer'],
  merchant_name: ['Merchant display name when supplied by the producer.', 'Example Shop'],
  link_id: ['Payment link UUID for link creation; INV-... display reference for engine payment status events.', linkID],
  payment_id: ['Payment link UUID for engine payment events; dispute UUID for refund events. See event notes.', linkID],
  amount: ['Amount string in this event\'s currency; see event notes for denomination.', '100.50'],
  currency: ['Amount denomination, which can be an invoice currency or a paid token symbol depending on the event.', 'USD'],
  transaction_hash: ['Transaction hash when available; may be an empty string.', '0x' + 'a'.repeat(64)],
  network: ['Network name, or chain ID as a string when a name cannot be resolved.', 'Ethereum'],
  asset: ['Producer-supplied asset/network label; currently empty for engine success/failure notifications.', ''],
  fees: ['Producer-supplied fee string; currently empty for engine success/failure notifications.', ''],
  received_at: ['Producer event time; engine success uses Go Time.String(), not the outer RFC 3339 format.', '2026-11-16 12:00:00 +0000 UTC'],
  failed_at: ['Producer failure time; may use Go Time.String() rather than RFC 3339.', '2026-11-16 12:00:00 +0000 UTC'],
  payment_url: ['Hosted checkout URL when supplied.', payURL],
  total_amount: ['Quoted total amount; engine partial-payment events use display token units.', '100.50'],
  partial_amount: ['Amount received so far in the same denomination as total_amount.', '40.25'],
  remaining_amount: ['Positive difference between total and received amounts.', '60.25'],
  payment_date_time: ['Payment detection time; current engine/partial producers use RFC 3339.', time],
  expected_amount: ['Expected amount; engine overpayment events use display token units.', '100.50'],
  received_amount: ['Received amount in the same denomination as expected_amount.', '105.50'],
  overpaid_amount: ['Positive excess above the expected amount.', '5.00'],
  refund_link: ['Payer-facing refund/checkout link supplied by the producer.', payURL],
  dispute_id: ['Dispute UUID when created; can be empty for an order-status notification.', disputeID],
  frontend_url: ['Legacy producer frontend URL; serialized as an empty string when unset.', ''],
  name: ['Payment link name (the payload uses name, while REST creation accepts payment_name).', 'Order #1234'],
  description: ['Optional payment link description.', 'Payment for Order #1234'],
  payment_status: ['Payment link status at notification creation.', 'processing'],
  payment_type: ['Payment link type.', 'one_time'],
  starts_at: ['Link start time; the merchant create producer uses YYYY-MM-DD HH:mm:ss.', '2026-11-16 12:00:00'],
  expires_at: ['Link/invitation expiry; format and availability depend on the producer.', '2026-11-17 12:00:00'],
  max_uses: ['Configured maximum number of uses, when present.', 1],
  current_uses: ['Payment link usage count.', 0],
  is_active: ['Payment link active flag.', true],
  product_name: ['Optional product name.', 'Example Product'],
  product_description: ['Optional product description.', 'Product details'],
  success_url: ['Optional success redirect URL.', 'https://example.com/thanks'],
  cancel_url: ['Optional cancellation redirect URL.', 'https://example.com/cancel'],
  cart: ['Optional original shopping-cart object.', { items: [{ name: 'Example Product', quantity: 1, unit_price: 100.5, total: 100.5 }], total: 100.5 }],
  webhook_metadata: ['Custom metadata copied by this producer; only payloads declaring this field carry it.', { order_ref: 'order-1234' }],
  merchant_customer_id: ['Internal merchant-customer record UUID, when provided.', '33333333-3333-3333-3333-333333333333'],
  customer_id: ['Merchant-supplied/generated customer reference, when provided.', 'customer-1234'],
  created_at: ['Producer creation time; it can be empty or use a non-RFC-3339 display format.', '2026-11-16 12:00:00'],
  refund_amount: ['Refund amount in the stated currency.', '5.00'],
  reason: ['Refund request or renewal failure reason.', 'Customer requested refund'],
  submitted_at: ['Refund request time when available; current payer-request path uses RFC 3339.', time],
  destination_address: ['Refund recipient wallet address when known; may be empty.', '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb3'],
  refunded_at: ['Optional refund time; some dispute producers leave it unset.', time],
  plan_id: ['Subscription plan database UUID.', planID],
  plan_name: ['Plan name when populated; some producers serialize an empty string.', 'Pro Monthly'],
  interval: ['String billing interval; some producers leave it empty. This payload field is not an integer.', '2592000'],
  trial_period: ['Optional trial period string.', '604800'],
  subscription_id: ['Subscription reference; merchant subscriber creation uses an INV-... display reference.', 'INV-LUL3BR-MX'],
  trial_expiry: ['Optional trial expiry string.', '2026-11-23T12:00:00Z'],
  subscribed_at: ['Subscription event time; merchant subscriber creation leaves this as an empty string.', time],
  next_renewal_at: ['Next renewal time supplied by the producer.', '2026-12-16T12:00:00Z'],
  renewed_at: ['Renewal time supplied by the producer.', time],
  grace_deadline: ['Grace deadline supplied by the producer.', '2026-11-19T12:00:00Z'],
  invitation_id: ['Subscriber invitation UUID (the Go field is named LinkID).', subID],
  invitation_url: ['Customer enrollment URL.', `https://pay.bitxpay.com/subscriptions/subscription_link?subscription_id=${subID}`],
  message: ['Optional invitation message.', 'Join Pro Monthly'],
};
const notes = {
  'payment.succeeded': 'Engine checkout emits this for a completed link. payment_id is the link UUID and link_id is its deterministic INV-... reference. amount/currency are the link\'s invoice denomination, not the raw token pay_amount. asset and fees are currently empty strings. Legacy listeners can instead use the payment token denomination. Overpaid engine orders emit transaction.overpaid rather than this event.',
  'payment.failed': 'The engine status path emits this for underpaid_expired, using the link amount/currency and the customer contact. asset and fees remain empty; payment_url is omitted by that producer. This code does not imply that every failed operation in the platform emits a webhook.',
  'payment.partial_succeeded': 'Engine underpaid_processing notifications use the catalog token symbol and display amounts obtained from pay_amount/observed plus token decimals. They are not fiat invoice amounts or raw base-unit integers. The engine producer includes payment_id, network, payment_url, and payment_date_time. Total = partial + remaining. Missing token metadata or a missing contact can prevent notification registration.',
  'transaction.overpaid': 'Engine overpaid_completed and overpayment-liability processing use display token amounts, with currency set to the catalog token symbol. Received = expected + overpaid. The status producer leaves dispute_id empty; the liability producer supplies its dispute UUID, so more than one notification can describe the same overpayment. frontend_url is currently empty for both engine producers. Legacy paths can populate different link/reference fields.',
  'payment_link.created': 'Merchant creation emits the link UUID in link_id, its name in name, and amount formatted to two decimals. The customer is the notification recipient; if no customer email is supplied, the merchant contact can be used. The DTO supports the optional fields below, but the current merchant producer only assigns description, max_uses, cart, webhook_metadata, and merchant_customer_id among them. product_name, product_description, success_url, cancel_url, and customer_id can therefore be absent even when REST creation stores them.',
  'payment.expired': 'Engine status sync emits this when the mapped link status becomes expired. link_id is an INV-... reference. amount/currency are the invoice denomination and expires_at is RFC 3339 when present. Notification registration requires a usable customer contact; API expiry/deactivation alone is not a guarantee of delivery.',
  'refund.initiated': 'The payer refund-request path emits this after marking a dispute as payer-initiated. payment_id is the dispute UUID, not the payment link UUID. refund_amount and currency come from the dispute. submitted_at is the request time, not the earlier dispute creation time.',
  'refund.succeeded': 'Dispute/refund resolution paths emit this. payment_id is the dispute UUID. transaction_hash, asset, and destination_address may be empty strings, and refunded_at can be omitted. Treat the payload as the backend\'s refund-resolution notification; a populated on-chain refund transaction is not guaranteed.',
  'subscription_plan.created': 'The DTO/parser support this event, but this checkout has no automatic production caller constructing SubscriptionPlanCreatedPayload. It can be registered through the authenticated notification test API. Do not assume create-plan emits it automatically.',
  'subscription.created': 'The merchant create-subscriber path emits this during invitation creation, before on-chain enrollment. subscription_id is generated from the subscriber UUID as an INV-... display reference, and plan_id is the plan UUID. That producer leaves plan_name, amount, currency, interval, and subscribed_at as empty strings and omits trial_expiry. webhook_metadata is copied when supplied. This event alone is not proof of an on-chain subscription payment.',
  'subscription.renewed': 'The DTO/parser support this event, but this checkout has no automatic production caller constructing SubscriptionRenewedPayload. It can be registered through the authenticated notification test API. Do not assume every recurring payment produces this event.',
  'subscription.renewal_failed': 'The DTO/parser support this event, but this checkout has no automatic production caller constructing SubscriptionRenewalFailedPayload. It can be registered through the authenticated notification test API.',
  'subscription_invitation.created': 'The dashboard subscriber path emits this using invitation_id = subscriber UUID and an enrollment invitation_url. It copies webhook_metadata. Its current producer sets the plan amount but leaves currency, interval, expires_at, and created_at as empty strings. The merchant create-subscriber path uses subscription.created instead.',
};
const overrides = {
  'payment.succeeded': { link_id: 'INV-EIRCEI-DQ', merchant_name: undefined },
  'payment.failed': { link_id: 'INV-EIRCEI-DQ', payment_url: undefined, merchant_name: undefined },
  'payment.partial_succeeded': { link_id: 'INV-EIRCEI-DQ', currency: 'USDC' },
  'transaction.overpaid': { link_id: 'INV-EIRCEI-DQ', currency: 'USDC', dispute_id: '' },
  'payment_link.created': { product_name: undefined, product_description: undefined, success_url: undefined, cancel_url: undefined, customer_id: undefined },
  'payment.expired': { link_id: 'INV-EIRCEI-DQ', expires_at: '2026-11-17T12:00:00Z', merchant_name: undefined },
  'refund.initiated': { payment_id: disputeID, currency: 'USDC', merchant_name: undefined },
  'refund.succeeded': { payment_id: disputeID, currency: 'USDC', transaction_hash: '', refunded_at: undefined, merchant_name: undefined, asset: 'Ethereum' },
  'subscription.created': { plan_name: '', amount: '', currency: '', interval: '', subscribed_at: '', trial_expiry: undefined },
  'subscription.renewed': { currency: 'USDC', amount: '10.00' },
  'subscription.renewal_failed': { currency: 'USDC', amount: '10.00', reason: 'Charge could not be collected' },
  'subscription_invitation.created': { amount: '10000000', currency: '', interval: '', expires_at: '', created_at: '', message: undefined },
};
const schema = { $schema: 'https://json-schema.org/draft/2020-12/schema', title: 'BITXpay merchant webhook delivery', description: 'Generated from notification payload DTOs and event constants. Optional fields may be omitted; consumers should tolerate new fields.', oneOf: [] };
const examples = {};
let markdown = `---\ntitle: Webhook Event Data\ndescription: Exact fields, serialization, and examples for all BITXpay merchant webhook event payloads.\n---\n\n# Webhook Event Data\n\nThis reference is generated from the backend notification DTOs, event constants, and event-to-payload parser. Producer-specific notes explain the behavior of the current checkout. Use the [webhook guide](/get-started/webhooks) for signature verification and the [management reference](/api-reference/webhooks) for configuration and testing.\n\nDownload the [JSON Schema](/webhooks/schema.json) and [complete example deliveries](/webhooks/examples.json). These describe merchant deliveries to your URL; engine-to-BITXpay callbacks have a different contract.\n\n## Reading the payload\n\nAll fields in the tables are inside the outer delivery's \`data\` object. “Always” means the JSON field is serialized even when it is an empty string, zero, or false; it does not promise a non-empty value. “When set” means the Go DTO uses omitempty. Examples include serialized defaults and represent the producer described in the notes, except DTO-only events, whose examples are test fixtures.\n\nThe outer fields are \`id\`, \`event_type\`, \`event_id\`, \`timestamp\`, and \`data\`. Only the outer timestamp is consistently RFC 3339; time strings inside data follow each producer. Amounts below are strings. Keep their event-specific denomination rather than treating every amount as fiat or every string as token base units.\n\nCustom \`webhook_metadata\` appears only in DTOs that declare it: payment_link.created, subscription.created, and subscription_invitation.created. The notification worker does not merge metadata, order_id, receipt_number, cart, or arbitrary REST response fields into other events.\n\n`;
for (const event of events) {
  if (!notes[event.code]) throw new Error(`Describe the producer for new event ${event.code}.`);
  const fields = fieldsFor(event.type);
  const properties = {};
  const required = [];
  const data = {};
  for (const field of fields) {
    const def = definitions[field.name];
    if (!def) throw new Error(`Describe new field ${event.type}.${field.name}.`);
    properties[field.name] = { type: field.type, description: def[0] };
    if (field.name === 'event_code') properties[field.name].const = event.code;
    if (!field.optional) required.push(field.name);
    let value = field.name === 'event_code' ? event.code : def[1];
    if (Object.hasOwn(overrides[event.code] || {}, field.name)) value = overrides[event.code][field.name];
    if (value !== undefined) data[field.name] = value;
    else if (!field.optional) throw new Error(`Example omits always-serialized field ${event.type}.${field.name}.`);
  }
  const dataSchema = { type: 'object', properties, required, additionalProperties: true };
  schema.oneOf.push({ title: event.code, type: 'object', properties: { id: { type: 'string' }, event_type: { const: event.code }, event_id: { type: 'string' }, timestamp: { type: 'string' }, data: dataSchema }, required: ['id', 'event_type', 'event_id', 'timestamp', 'data'], additionalProperties: true });
  examples[event.code] = { id: '558e008e-a31c-4fe8-8c81-284ece730cdf', event_type: event.code, event_id: '3f01958c-8f10-4982-87f9-c129f60531b5', timestamp: time, data };
  markdown += `## ${event.code}\n\n${notes[event.code]}\n\n| Field | JSON type | Serialized | Meaning |\n|-------|-----------|------------|---------|\n`;
  for (const field of fields) markdown += `| \`${field.name}\` | ${field.type} | ${field.optional ? 'When set' : 'Always'} | ${definitions[field.name][0]} |\n`;
  markdown += `\nExample data (${event.type}):\n\n\`\`\`json\n${JSON.stringify(data, null, 2)}\n\`\`\`\n\n`;
}
const outputs = new Map([
  ['docs/api-reference/webhook-events.md', markdown],
  ['docs/public/webhooks/schema.json', JSON.stringify(schema, null, 2) + '\n'],
  ['docs/public/webhooks/examples.json', JSON.stringify(examples, null, 2) + '\n'],
]);

// Inventory the integration-facing route registrations, preserving the actual
// registration paths rather than Swagger's sometimes stale @Router comments.
const routeSources = [
  ['Merchant payment links', 'internal/payments/route/merchant_payment_routes.go', 'SetupMerchantPaymentRoutes', 'Merchant API key + signature'],
  ['Merchant subscriptions', 'internal/subscription/route/merchant_route.go', 'SetupMerchantSubscriptionRoutes', 'Merchant API key + signature'],
  ['Public engine checkout', 'internal/payments_engine/route/checkout_routes.go', 'SetupEnginePublicRoutes', 'None; mounted only when engine checkout is ready'],
  ['Public payment links and legacy checkout', 'internal/payments/route/payment_route.go', 'SetupPublicPaymentRoutes', 'None'],
  ['Public subscriptions', 'internal/subscription/route/subscription_route.go', 'SetupPublicSubscriptionRoutes', 'None'],
  ['Network metadata', 'internal/networks/route/route.go', 'SetupNetworkRoutes', 'None'],
  ['Assets', 'internal/assets/route/route.go', 'SetupAssetRoutes', 'None in route registration'],
  ['Contact', 'internal/contact/route/route.go', 'SetupContactRoutes', 'None in route registration'],
  ['Webhook management', 'internal/notification/route/route.go', 'SetupWebhookRoutes', 'Dashboard session'],
  ['Incoming webhook receiver', 'internal/notification/route/route.go', 'SetupPublicWebhookRoutes', 'No dashboard session; receiver-specific secret handling'],
  ['Mass payouts', 'internal/mass_payouts/routes/routes.go', 'SetupMerchantMassPayoutRoutes', 'Dashboard session followed by merchant API-key middleware in current route order'],
];
function functionSource(source, name) {
  const start = source.indexOf(`func ${name}(`);
  if (start < 0) throw new Error(`Missing route setup ${name}.`);
  const next = source.indexOf('\nfunc ', start + 1);
  return source.slice(start, next < 0 ? undefined : next);
}
let routeMarkdown = '---\ntitle: Public API Route Inventory\ndescription: Source-derived routes and authentication boundaries for BITXpay integrations.\n---\n\n# Public API Route Inventory\n\nThis inventory is generated from route registrations in the backend checkout. All paths include the actual `/api/v1` prefix. It covers merchant payments/subscriptions, public checkout and metadata, webhook management, and the API-key mass-payout group. Dashboard wallet/authentication, admin, and engine-to-BITXpay infrastructure callbacks are separate surfaces.\n\nFor payloads use [Payments](/api-reference/payments), [Checkout](/api-reference/checkout), [Subscriptions](/api-reference/subscriptions), [Webhook Event Data](/api-reference/webhook-events), and [Webhook Management](/api-reference/webhooks). A registered route does not imply every deployment enables its downstream services.\n\nMass payouts are registered after global dashboard authentication in `internal/routes/routes.go`; their local merchant-key middleware does not remove that parent authentication requirement. The `/mass_payouts` group is therefore not a working API-key-only entry point in this checkout. Localchain routes are development helpers. Contact/assets routes are included to make the inventory complete; they are not merchant payment-link CRUD.\n\n';
let routeCount = 0;
for (const [title, file, name, auth] of routeSources) {
  const source = functionSource(read(file), name);
  const groups = new Map([['api', '/api/v1'], ['router', '/api/v1']]);
  const routes = [];
  for (const line of source.split('\n')) {
    if (line.trim().startsWith('//')) continue;
    const group = line.match(/(\w+) := (\w+)\.Group\("([^"]+)"\)/);
    if (group) {
      if (!groups.has(group[2])) throw new Error(`Unknown route parent ${group[2]}.`);
      groups.set(group[1], groups.get(group[2]) + group[3]);
    }
    const route = line.match(/(\w+)\.(Get|Post|Put|Patch|Delete)\("([^"]+)"/);
    if (route) {
      if (!groups.has(route[1])) throw new Error(`Unknown route group ${route[1]}.`);
      routes.push([route[2].toUpperCase(), groups.get(route[1]) + route[3]]);
    }
  }
  if (!routes.length) throw new Error(`No routes found in ${name}.`);
  routeCount += routes.length;
  routeMarkdown += `## ${title}\n\nAuthentication: ${auth}. Source: \`${file}\` (\`${name}\`).\n\n| Method | Path |\n|--------|------|\n`;
  for (const [method, route] of routes) routeMarkdown += `| \`${method}\` | \`${route}\` |\n`;
  routeMarkdown += '\n';
}
outputs.set('docs/api-reference/public-api-routes.md', routeMarkdown);
// Complete field lists supplement the endpoint guides, including mixed-case
// legacy checkout fields and raw model responses. This is a field contract,
// not a claim that every shared DTO validation tag runs in every controller.
const modelSources = [
  ['Merchant payments', 'internal/payments/dto/merchant_payment_dto.go', null],
  ['Payer checkout', 'internal/payments/dto/payment_dto.go', ['QuotationRequest', 'QuotationResponse', 'EngineQuoteBreakdown', 'PaymentLinkResponse', 'PaymentLinkValidationResponse', 'PaymentLinkPollingResponse', 'CreatePayerRequest', 'PayerResponse', 'PaymentTransactionRequestV2', 'PaymentTransactionResponseV2', 'Tempmail', 'TempmailResponse']],
  ['Engine checkout', 'internal/payments_engine/route/checkout_routes.go', ['payScreenOrder', 'quoteRequest']],
  ['Checkout catalog', 'internal/payments_engine/client/types.go', ['CatalogToken', 'CatalogChain', 'Catalog', 'OrderOptions']],
  ['Subscription plans', 'internal/subscription/dto/subscription_plan_dto.go', null],
  ['Subscription enrollment', 'internal/subscription/dto/subscription_plan.go', ['ApprovalDetail', 'CreateSubscriptionLinkRequest', 'UpdateSubscriptionLinkRequest', 'SubscriptionLinkListRequest', 'SubscriptionPlanSummary', 'SubscriptionLinkResponse', 'SubscriptionLinkListResponse', 'RecordSubscriptionPaymentRequest', 'SubscriptionResponse', 'CreateSubscriberRequest', 'SubscriberResponse', 'SubscriberListRequest', 'UpdateSubscriberRequest', 'SubscriberListResponse', 'InvitationListResponse', 'SubscriberWithLinkResponse', 'SubscriptionMetaAttribute', 'SubscriptionMetaResponse']],
  ['Subscription preparation', 'internal/subscription/dto/prepare.go', null],
  ['Stored subscriber model', 'internal/model/subscribers.go', ['Subscriber']],
  ['Stored subscription link model', 'internal/model/subscription_link.go', ['SubscriptionLink']],
  ['Webhook management', 'internal/notification/dto/webhook_dto.go', ['CreateWebhookRequest', 'CreateEventSubscriptionItem', 'UpdateWebhookRequest', 'WebhookEventSubscriptionResponse', 'EventResponse', 'WebhookResponse', 'WebhookListResponse', 'WebhookDeleteResponse', 'RegenerateSecretResponse', 'ValidateSecretRequest', 'ValidateSecretResponse', 'BulkToggleWebhookSubscriptionsRequest', 'SubscriptionToggleItem', 'BulkToggleWebhookSubscriptionsResponse', 'WebhookActivityLog', 'WebhookDeliveryAttempt', 'WebhookActivityResponse', 'RegisterNotificationRequest', 'RegisterNotificationResponse', 'AcknowledgeWebhookRequest', 'AcknowledgeWebhookResponse', 'PollingInfo', 'WebhookEventPayload', 'WebhookPollingEvent', 'WebhookEventsPollingResponse']],
];
function jsonType(goType) {
  const type = goType.replace(/^\*/, '');
  if (type.startsWith('[]')) return 'array of ' + jsonType(type.slice(2));
  if (type === 'time.Time') return 'RFC 3339 string';
  if (type === 'uuid.UUID') return 'UUID string';
  if (type === 'json.RawMessage' || type === 'datatypes.JSON' || type === 'interface{}') return 'JSON value';
  if (type.startsWith('map[')) return 'object';
  if (/^(u?int\d*|float\d*)$/.test(type)) return type.startsWith('float') ? 'number' : 'integer';
  if (type === 'Approvals') return 'array of ApprovalDetail objects';
  if (type === 'bool') return 'boolean';
  if (type === 'string' || /(?:Status|Type)$/.test(type)) return 'string';
  return type.split('.').at(-1) + ' object';
}
const models = [];
for (const [group, file, selected] of modelSources) {
  const source = read(file);
  const found = new Set();
  for (const match of source.matchAll(/type (\w+) struct \{([\s\S]*?)\n\}/g)) {
    if (selected && !selected.includes(match[1])) continue;
    found.add(match[1]);
    const fields = [];
    for (const line of match[2].split('\n')) {
      if (!line.trim() || line.trim().startsWith('//')) continue;
      if (/^\s*Catalog\s*$/.test(line)) {
        const catalog = models.find(model => model.name === 'Catalog');
        if (!catalog) throw new Error('Missing embedded Catalog fields.');
        fields.push(...catalog.fields);
        continue;
      }
      const field = line.match(/^\s*(\w+)\s+(\S+)(?:\s+`([^`]+)`)?(?:\s*\/\/\s*(.*))?\s*$/);
      if (!field) throw new Error(`Review field parsing for ${match[1]}: ${line}`);
      const tags = field[3] || '';
      const jsonTag = tags.match(/json:"([^"]+)"/)?.[1];
      const queryTag = tags.match(/query:"([^"]+)"/)?.[1];
      if (jsonTag === '-') continue;
      const binding = queryTag ? 'query' : 'json';
      const tag = queryTag || jsonTag || field[1];
      fields.push({ name: tag.split(',')[0], type: jsonType(field[2]), goType: field[2], binding, omitEmpty: tag.includes('omitempty'), nullable: field[2].startsWith('*') || field[2].startsWith('[]') || field[2].startsWith('map[') || field[2] === 'Approvals', validation: tags.match(/validate:"([^"]+)"/)?.[1] || '', description: field[4] || '' });
    }
    // OrderOptions embeds Catalog, so preserve its fields too.
    models.push({ group, name: match[1], source: file, fields });
  }
  if (selected && selected.some(name => !found.has(name))) throw new Error(`Missing model in ${file}: ${selected.filter(name => !found.has(name)).join(', ')}`);
}
let modelMarkdown = '---\ntitle: Request and Response Fields\ndescription: Source-derived field names and types for current payment, checkout, subscription, and webhook models.\n---\n\n# Request and Response Fields\n\nThis generated reference lists the exact field names and types in the backend models used by the integration APIs. Use the endpoint guides for HTTP status, envelopes, defaults, and service behavior. [Download the field contracts](/api/field-contracts.json).\n\nNames are case-sensitive. JSON fields without omitempty remain present when empty or zero; pointers can be null. A Go time.Time is encoded as an RFC 3339 string and can remain present even with an omitempty tag. Array/map fields without omitempty can be null when uninitialized. Shared request validation tags describe declared constraints; controller/service behavior determines which are enforced. Request optionality is not implied by the response serialization column.\n\nWebhook event data has its own [complete reference](/api-reference/webhook-events); webhook management responses below are not the data object of an event. Engine amounts are decimal strings in base units in the engine response, while compatibility checkout uses display numbers for top-level amount fields.\n\n';
let lastGroup;
for (const model of models) {
  if (lastGroup !== model.group) { modelMarkdown += `## ${model.group}\n\n`; lastGroup = model.group; }
  modelMarkdown += `### ${model.name}\n\n| Field | Type | Binding | Serialization | Declared validation |\n|-------|------|---------|---------------|---------------------|\n`;
  for (const field of model.fields) modelMarkdown += `| \`${field.name}\` | ${field.type} | ${field.binding} | ${field.omitEmpty ? 'omitempty' : 'Included'}${field.nullable ? '; nullable' : ''} | ${field.validation ? '`' + field.validation.replaceAll('|', '\\|') + '`' : '—'} |\n`;
  modelMarkdown += '\n';
}
outputs.set('docs/api-reference/data-models.md', modelMarkdown);
outputs.set('docs/public/api/field-contracts.json', JSON.stringify(models, null, 2) + '\n');

let stale = false;
for (const [name, content] of outputs) {
  const target = path.join(root, name);
  if (check) {
    if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== content) {
      console.error(`Out of sync: ${name}`); stale = true;
    }
  } else {
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content);
  }
}
if (stale) { console.error('Run npm run docs:sync and review producer-specific behavior notes.'); process.exitCode = 1; }
else console.log(`${check ? 'Verified' : 'Synced'} ${events.length} webhook payloads, ${routeCount} registered routes, and ${models.length} request/response models.`);
