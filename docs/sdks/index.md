# SDKs & Libraries

The backend includes server-side SDKs for payment links, merchant subscriptions, and webhook verification. Each uses your dashboard-issued Ed25519 private key to sign requests. Keep these clients and credentials on your server.

| Language | Package | Requirements | Guide |
|----------|---------|--------------|-------|
| JavaScript / TypeScript | `@bitxpay/sdk` | Node.js 18+ | [JavaScript SDK](/sdks/javascript-sdk) |
| Python | `bitxpay` | Python 3.8+, `cryptography` | [SDK examples](/get-started/sdks-libraries#python) |
| PHP | `bitxpay/sdk` | PHP 7.4+, sodium/curl/json | [SDK examples](/get-started/sdks-libraries#php) |

Source packages are in `bitxpay-api/sdks/typescript`, `sdks/python`, and `sdks/php`. See the [API Reference](/api-reference/) for the current request and response contract, including newer public checkout endpoints and known SDK type differences.

For browser wallet integration, see the separate [Wallet SDK guide](/sdks/wallet-sdk). Merchant API keys and private keys must stay on your backend.

You can also call REST from any language using the [Authentication guide](/api-reference/authentication).
