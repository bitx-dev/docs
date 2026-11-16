# SDKs and Libraries

The backend repository includes server SDKs for TypeScript/JavaScript, Python, and PHP. They sign requests with your merchant private key and cover payment links, merchant subscriptions, and webhook verification.

| Language | Package | Source directory | Requirements |
|----------|---------|------------------|--------------|
| Node.js / TypeScript | `@bitxpay/sdk` | `bitxpay-api/sdks/typescript` | Node.js 18+ |
| Python | `bitxpay` | `bitxpay-api/sdks/python` | Python 3.8+, `cryptography` |
| PHP | `bitxpay/sdk` | `bitxpay-api/sdks/php` | PHP 7.4+, sodium, curl, json |

## JavaScript / TypeScript

```typescript
import { BitxpayClient } from '@bitxpay/sdk';

const client = new BitxpayClient({
  apiKey: process.env.BITXPAY_API_KEY!,
  privateKey: process.env.BITXPAY_PRIVATE_KEY!,
  environment: 'sandbox',
});
const link = await client.payments.create({
  payment_name: 'Order #1234', amount: 49.99, currency: 'USD', is_test: true,
});
console.log(link.id, link.payment_status);
```

See the [JavaScript SDK guide](/sdks/javascript-sdk) for configuration, pagination, and current response-type limitations.

## Python

```bash
pip install bitxpay
```

```python
import os
from bitxpay import BitxpayClient

client = BitxpayClient(
    api_key=os.environ['BITXPAY_API_KEY'],
    private_key=os.environ['BITXPAY_PRIVATE_KEY'],
    environment='sandbox',
)
link = client.payments.create(
    payment_name='Order #1234', amount=49.99, currency='USD', is_test=True,
)
print(link['payment_url'], link['payment_status'])
```

For a local repository checkout, install `bitxpay-api/sdks/python` with `pip install -e .` from that directory.

## PHP

```bash
composer require bitxpay/sdk
```

```php
<?php
require 'vendor/autoload.php';

$client = new \Bitxpay\Client([
    'api_key' => getenv('BITXPAY_API_KEY'),
    'private_key' => getenv('BITXPAY_PRIVATE_KEY'),
    'environment' => 'sandbox',
]);
$link = $client->payments->create([
    'payment_name' => 'Order #1234', 'amount' => 49.99,
    'currency' => 'USD', 'is_test' => true,
]);
echo $link['payment_url'];
```

Use the actual REST field names in returned dictionaries/arrays: `payment_url`, `payment_name`, and `payment_status`. Create-subscriber data contains `subscriber` and `subscription_link`. For plan creation, follow the [current request schema](/api-reference/subscriptions#_1-create-subscription-plan); some bundled SDK plan examples/types reflect an older API payload.

## Using REST directly

Use the [Authentication guide](/api-reference/authentication) and its executable Node.js/Python signing snippets. Sign the full `/api/v1/...` path and send `X-API-Key`, `X-API-Signature`, and `X-API-Timestamp`. Merchant `amount` is a positive JSON number; checkout token amounts and subscription amounts are strings with endpoint-specific units.
