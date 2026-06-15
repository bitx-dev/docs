# SDKs & Libraries

BITXpay provides official SDKs to help you integrate faster — no manual request signing, no boilerplate. Pick the SDK that fits your stack and start accepting payments in minutes.

## Available SDKs

<div class="sdk-grid">

### @bitxpay/sdk

The core JavaScript / TypeScript SDK for server-side integrations. Works with Node.js and any TypeScript project.

- Full payment lifecycle management
- Request signing handled automatically
- Webhook verification utilities
- TypeScript types included

[View Documentation →](/sdks/javascript-sdk)

```bash
npm install @bitxpay/sdk
```

---

### @bitxpay/wallet-sdk

The wallet SDK for client-side and mobile integrations. Connect wallets, sign transactions, and interact with the BITXpay ecosystem directly from a browser or React Native app.

- Wallet connection and management
- Transaction signing
- Multi-chain support
- React hooks included

[View Documentation →](/sdks/wallet-sdk)

```bash
npm install @bitxpay/wallet-sdk
```

</div>

## Which SDK should I use?

| Use Case | Recommended SDK |
|----------|----------------|
| Server-side payment creation | `@bitxpay/sdk` |
| REST API abstraction (Node.js/TS) | `@bitxpay/sdk` |
| Client-side wallet connection | `@bitxpay/wallet-sdk` |
| Browser / React Native dApp | `@bitxpay/wallet-sdk` |
| Full-stack application | Both |

## Requirements

| SDK | Runtime | Min Version |
|-----|---------|-------------|
| `@bitxpay/sdk` | Node.js | 16+ |
| `@bitxpay/wallet-sdk` | Browser / React Native | - |

## Not using JavaScript?

You can use the BITXpay REST API directly from any language. See the [API Reference](/api-reference/) for full endpoint documentation and the [Authentication guide](/get-started/authentication) for request signing details.
