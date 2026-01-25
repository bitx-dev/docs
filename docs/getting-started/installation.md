---
title: Installation
description: Install and configure the BitXPay SDK for your preferred programming language.
---

# Installation

BitXPay provides official SDKs for popular programming languages. Choose your preferred language below.

## JavaScript / Node.js

::: code-group

```bash [npm]
npm install @bitxpay/sdk
```

```bash [yarn]
yarn add @bitxpay/sdk
```

```bash [pnpm]
pnpm add @bitxpay/sdk
```

:::

### Configuration

```javascript
import { BitXPay } from '@bitxpay/sdk';

const bitxpay = new BitXPay({
  apiKey: process.env.BITXPAY_API_KEY,
  secretKey: process.env.BITXPAY_SECRET_KEY,
  environment: 'sandbox'
});
```

## Python

```bash
pip install bitxpay
```

### Configuration

```python
from bitxpay import BitXPay

bitxpay = BitXPay(
    api_key=os.environ.get('BITXPAY_API_KEY'),
    secret_key=os.environ.get('BITXPAY_SECRET_KEY'),
    environment='sandbox'
)
```

## PHP

```bash
composer require bitxpay/bitxpay-php
```

### Configuration

```php
<?php
require_once 'vendor/autoload.php';

use BitXPay\Client;

$bitxpay = new Client([
    'api_key' => getenv('BITXPAY_API_KEY'),
    'secret_key' => getenv('BITXPAY_SECRET_KEY'),
    'environment' => 'sandbox'
]);
```

## cURL (Direct API)

If there's no SDK for your language, you can use the REST API directly:

```bash
curl -X POST https://api.bitxpay.com/v1/payments \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -H "X-Signature: HMAC_SIGNATURE" \
  -d '{
    "amount": 100.00,
    "currency": "USD",
    "crypto": "BTC"
  }'
```

## Environment Variables

We recommend storing your credentials in environment variables:

```bash
# .env file
BITXPAY_API_KEY=your_api_key_here
BITXPAY_SECRET_KEY=your_secret_key_here
BITXPAY_ENVIRONMENT=sandbox
```

::: danger
Never commit your `.env` file or API credentials to version control!
:::

## Next Steps

- [Quick Start Guide](./quick-start) - Create your first payment
- [API Reference](/api-reference/) - Explore all available endpoints
