---
title: Authentication
description: Learn how to authenticate API requests with BitXPay.
---

# Authentication

BitXPay uses HMAC-based authentication to secure API requests. Every request must include your API key and a signature.

## Required Headers

| Header | Description |
|--------|-------------|
| `Authorization` | Bearer token with your API key |
| `X-Signature` | HMAC-SHA256 signature of the request |
| `X-Timestamp` | Unix timestamp of the request |
| `Content-Type` | `application/json` |

## Generating the Signature

The signature is created by signing the request payload with your secret key:

```javascript
import crypto from 'crypto';

function generateSignature(secretKey, timestamp, method, path, body = '') {
  const payload = `${timestamp}${method}${path}${body}`;

  return crypto
    .createHmac('sha256', secretKey)
    .update(payload)
    .digest('hex');
}
```

## Complete Example

```javascript
import crypto from 'crypto';

const apiKey = process.env.BITXPAY_API_KEY;
const secretKey = process.env.BITXPAY_SECRET_KEY;

async function makeRequest(method, path, body = null) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = body ? JSON.stringify(body) : '';

  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${timestamp}${method}${path}${bodyString}`)
    .digest('hex');

  const response = await fetch(`https://api.bitxpay.com/v1${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-Signature': signature,
      'X-Timestamp': timestamp,
      'Content-Type': 'application/json'
    },
    body: body ? bodyString : undefined
  });

  return response.json();
}

// Usage
const payment = await makeRequest('POST', '/payments', {
  amount: 100,
  currency: 'USD',
  crypto: 'BTC'
});
```

## Python Example

```python
import hmac
import hashlib
import time
import requests
import json

api_key = os.environ.get('BITXPAY_API_KEY')
secret_key = os.environ.get('BITXPAY_SECRET_KEY')

def make_request(method, path, body=None):
    timestamp = str(int(time.time()))
    body_string = json.dumps(body) if body else ''

    payload = f"{timestamp}{method}{path}{body_string}"
    signature = hmac.new(
        secret_key.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    headers = {
        'Authorization': f'Bearer {api_key}',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'Content-Type': 'application/json'
    }

    response = requests.request(
        method,
        f'https://api.bitxpay.com/v1{path}',
        headers=headers,
        json=body
    )

    return response.json()
```

## Timestamp Validation

Requests with timestamps older than 5 minutes will be rejected:

```json
{
  "success": false,
  "error": {
    "code": "TIMESTAMP_EXPIRED",
    "message": "Request timestamp is too old"
  }
}
```

## Security Best Practices

::: warning
Keep your secret key secure and never expose it in client-side code.
:::

1. **Store keys securely** - Use environment variables or a secrets manager
2. **Use HTTPS** - All API requests must use HTTPS
3. **Rotate keys periodically** - Generate new API keys regularly
4. **Limit key permissions** - Use keys with minimal required permissions
5. **Monitor API usage** - Check your dashboard for unusual activity
