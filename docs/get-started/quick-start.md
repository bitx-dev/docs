# Quick Start

Get started with BITXpay in minutes. This guide will walk you through creating your first payment integration.

## Prerequisites

Before you begin, ensure you have:

- A BITXpay merchant account ([Sign up here](https://sandbox.bitxpay.com/auth/signup))
- API credentials (API Key and DSA private key)
- Basic knowledge of REST APIs
- A development environment with Node.js, Python, or your preferred language

## Step 1: Get your API credentials

1. Log in to your [BITXpay Dashboard](https://sandbox.bitxpay.com/dashboard)
2. Navigate to **Developers** → **API Keys**
3. Click **Create API Key**
4. Save your API Key (`btxm_xxxxxxxxxx`) and DSA private key securely

::: warning Keep your credentials safe
Never commit API keys or private keys to version control or expose them in client-side code.
:::

## Step 2: Make your first API call

Test your credentials by fetching your account information:

::: code-group

```bash [cURL]
curl -X GET {{ $api.sandbox.baseUrl }}/account \
  -H "X-API-Key: btxm_xxxxxxxxxxxx" \
  -H "X-API-Signature: <base64_encoded_dsa_signature>" \
  -H "X-API-Timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

```javascript [Node.js]
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const apiKey = process.env.MERCHANT_API_KEY; // btxm_xxxxxxxxxxxx
const privateKey = fs.readFileSync('private-key.pem', 'utf8');
const timestamp = new Date().toISOString();

function generateDSASignature(privateKeyPEM, method, path, timestamp, body = '') {
  const message = `${method}${path}${timestamp}${body}`;
  // DSA signature using SHA-256
  const signature = crypto.sign(
    'sha256',
    Buffer.from(message, 'utf8'),
    {
      key: privateKeyPEM,
      dsaEncoding: 'der'
    }
  );
  return signature.toString('base64');
}

const signature = generateDSASignature(privateKey, 'GET', '/account', timestamp);

axios.get('{{ $api.sandbox.baseUrl }}/account', {
  headers: {
    'X-API-Key': apiKey,
    'X-API-Signature': signature,
    'X-API-Timestamp': timestamp
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

```python [Python]
import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend
import base64
from datetime import datetime
import os

api_key = os.environ.get('MERCHANT_API_KEY')  # btxm_xxxxxxxxxxxx

# Load your DSA private key
with open('private-key.pem', 'r') as f:
    private_key_pem = f.read()

private_key = serialization.load_pem_private_key(
    private_key_pem.encode(),
    password=None,
    backend=default_backend()
)

timestamp = datetime.utcnow().isoformat() + 'Z'

def generate_dsa_signature(private_key, method, path, timestamp, body=''):
    message = f'{method}{path}{timestamp}{body}'
    signature = private_key.sign(
        message.encode('utf-8'),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')

signature = generate_dsa_signature(private_key, 'GET', '/account', timestamp)

response = requests.get(
    '{{ $api.sandbox.baseUrl }}/account',
    headers={
        'X-API-Key': api_key,
        'X-API-Signature': signature,
        'X-API-Timestamp': timestamp
    }
)

print(response.json())
```

:::

## Step 3: Create a payment

Create your first payment request:

::: code-group

```javascript [Node.js]
const axios = require('axios');
const crypto = require('crypto');
const fs = require('fs');

const apiKey = process.env.MERCHANT_API_KEY;
const privateKey = fs.readFileSync('private-key.pem', 'utf8');
const timestamp = new Date().toISOString();
const method = 'POST';
const path = '/payment_links';
const body = JSON.stringify({
  payment_name: 'Test Payment',
  amount: 10,
  currency: 'USD',
  success_url: 'https://yoursite.com/success',
  cancel_url: 'https://yoursite.com/cancel'
});

function generateDSASignature(privateKeyPEM, method, path, timestamp, body = '') {
  const message = `${method}${path}${timestamp}${body}`;
  const signature = crypto.sign(
    'sha256',
    Buffer.from(message, 'utf8'),
    {
      key: privateKeyPEM,
      dsaEncoding: 'der'
    }
  );
  return signature.toString('base64');
}

const signature = generateDSASignature(privateKey, method, path, timestamp, body);

axios.post(`{{ $api.sandbox.baseUrl }}${path}`, body, {
  headers: {
    'X-API-Key': apiKey,
    'X-API-Signature': signature,
    'X-API-Timestamp': timestamp,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('Payment created:', response.data);
  console.log('Payment URL:', response.data.hosted_url);
})
.catch(error => console.error(error));
```

```python [Python]
import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend
import base64
from datetime import datetime
import json
import os

api_key = os.environ.get('MERCHANT_API_KEY')

# Load your DSA private key
with open('private-key.pem', 'r') as f:
    private_key_pem = f.read()

private_key = serialization.load_pem_private_key(
    private_key_pem.encode(),
    password=None,
    backend=default_backend()
)

timestamp = datetime.utcnow().isoformat() + 'Z'
method = 'POST'
path = '/payment_links'
body = json.dumps({
    'payment_name': 'Test Payment',
    'amount': 10,
    'currency': 'USD',
    'success_url': 'https://yoursite.com/success',
    'cancel_url': 'https://yoursite.com/cancel'
})

def generate_dsa_signature(private_key, method, path, timestamp, body=''):
    message = f'{method}{path}{timestamp}{body}'
    signature = private_key.sign(
        message.encode('utf-8'),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')

signature = generate_dsa_signature(private_key, method, path, timestamp, body)

response = requests.post(
    f'{{ $api.sandbox.baseUrl }}{path}',
    headers={
        'X-API-Key': api_key,
        'X-API-Signature': signature,
        'X-API-Timestamp': timestamp,
        'Content-Type': 'application/json'
    },
    data=body
)

result = response.json()
print('Payment created:', result)
print('Payment URL:', result['hosted_url'])
```

:::

## Step 4: Handle webhooks

Set up a webhook endpoint to receive payment notifications:

::: code-group

```javascript [Express.js]
const express = require('express');
const crypto = require('crypto');

const app = express();

// IMPORTANT: Use express.raw() for webhook routes to preserve the raw body for signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-bitxpay-signature'];
  const payload = req.body; // Raw buffer
  
  // Verify webhook signature using HMAC-SHA256
  const expectedSignature = crypto
    .createHmac('sha256', process.env.WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  const event = JSON.parse(payload);
  console.log('Webhook received:', event.type);
  
  switch (event.type) {
    case 'payment.completed':
      console.log('Payment completed:', event.data.id);
      // Update your database, fulfill order, etc.
      break;
    case 'payment.failed':
      console.log('Payment failed:', event.data.id);
      break;
  }
  
  res.status(200).send('OK');
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));
```

```python [Flask]
from flask import Flask, request
import hmac
import hashlib
import json
import os

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Bitxpay-Signature')
    # Use raw data for signature verification
    payload = request.get_data()
    
    # Verify webhook signature using HMAC-SHA256
    expected_signature = hmac.new(
        os.environ['WEBHOOK_SECRET'].encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if not hmac.compare_digest(signature, expected_signature):
        return 'Invalid signature', 401
    
    # Process the webhook
    event = json.loads(payload)
    print(f'Webhook received: {event["type"]}')
    
    if event['type'] == 'payment.completed':
        print(f'Payment completed: {event["data"]["id"]}')
        # Update your database, fulfill order, etc.
    elif event['type'] == 'payment.failed':
        print(f'Payment failed: {event["data"]["id"]}')
    
    return 'OK', 200

if __name__ == '__main__':
    app.run(port=3000)
```

:::

## Step 5: Test in sandbox

BITXpay provides a sandbox environment for testing:

- **Sandbox API**: `https://sandboxapi.bitxpay.com/api/v1`
- **Sandbox Dashboard**: [sandbox.bitxpay.com](https://sandbox.bitxpay.com)

Use sandbox credentials to test your integration without real funds.

## Next steps

Now that you've created your first payment, explore more features:

- [Authentication](/get-started/authentication) - Learn about security best practices
- [Webhooks](/integration/webhooks) - Deep dive into webhook events
<!-- - [SDKs and Libraries](/get-started/sdks-libraries) - Use our official SDKs -->
- [API Reference](/api-reference/) - Explore all available endpoints

## Common issues

### Invalid signature error

Make sure you're:
- Using the correct DSA private key
- Including the timestamp in the signature (ISO 8601 format)
- Formatting the message string correctly: `${method}${path}${timestamp}${body}` — e.g. `POST/payment_links2026-01-31T12:00:00Z{...}`
- Using SHA-256 hash with DER encoding
- Encoding the final signature as Base64

### Webhook not receiving events

Verify that:
- Your webhook URL is publicly accessible
- You're returning a 200 status code
- Your server supports HTTPS (required for production)

### Payment not completing

Check that:
- The amount is formatted correctly (string with 2 decimal places)
- The currency is supported
- The redirect URL is valid

For more troubleshooting help, see our [Troubleshooting Guide](/testing/troubleshooting).
