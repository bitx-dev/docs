# Quick Start

Get started with BITXpay in minutes. This guide will walk you through creating your first payment integration.

## Prerequisites

Before you begin, ensure you have:

- A BITXpay account ([Sign up here](https://sandbox.bitxpay.com/auth/signup))
- API credentials (API Key and Secret)
- Basic knowledge of REST APIs
- A development environment with Node.js, Python, or your preferred language

## Step 1: Get your API credentials

1. Log in to your BITXpay dashboard at [sandbox.bitxpay.com](https://sandbox.bitxpay.com)
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Save your API Key ID and Secret securely

::: warning Keep your credentials safe
Never commit API keys to version control or expose them in client-side code.
:::

## Step 2: Make your first API call

Test your credentials by fetching your account information:

::: code-group

```bash [cURL]
curl -X GET https://api.bitxpay.com/v1/account \
  -H "X-API-Key: your-api-key" \
  -H "X-Signature: your-signature" \
  -H "X-Timestamp: $(date +%s)000"
```

```javascript [Node.js]
const axios = require('axios');
const crypto = require('crypto');

const apiKey = 'your-api-key';
const apiSecret = 'your-api-secret';
const timestamp = Date.now().toString();

function generateSignature(secret, timestamp, method, path) {
  const message = `${timestamp}${method}${path}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

const signature = generateSignature(apiSecret, timestamp, 'GET', '/v1/account');

axios.get('https://api.bitxpay.com/v1/account', {
  headers: {
    'X-API-Key': apiKey,
    'X-Signature': signature,
    'X-Timestamp': timestamp
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));
```

```python [Python]
import requests
import hmac
import hashlib
import time

api_key = 'your-api-key'
api_secret = 'your-api-secret'
timestamp = str(int(time.time() * 1000))

def generate_signature(secret, timestamp, method, path):
    message = f'{timestamp}{method}{path}'
    return hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()

signature = generate_signature(api_secret, timestamp, 'GET', '/v1/account')

response = requests.get(
    'https://api.bitxpay.com/v1/account',
    headers={
        'X-API-Key': api_key,
        'X-Signature': signature,
        'X-Timestamp': timestamp
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

const apiKey = 'your-api-key';
const apiSecret = 'your-api-secret';
const timestamp = Date.now().toString();
const method = 'POST';
const path = '/v1/payments';
const body = JSON.stringify({
  amount: '100.00',
  currency: 'USD',
  description: 'Test payment',
  redirect_url: 'https://yoursite.com/success',
  webhook_url: 'https://yoursite.com/webhook'
});

function generateSignature(secret, timestamp, method, path, body) {
  const message = `${timestamp}${method}${path}${body}`;
  return crypto.createHmac('sha256', secret).update(message).digest('hex');
}

const signature = generateSignature(apiSecret, timestamp, method, path, body);

axios.post('https://api.bitxpay.com/v1/payments', body, {
  headers: {
    'X-API-Key': apiKey,
    'X-Signature': signature,
    'X-Timestamp': timestamp,
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
import hmac
import hashlib
import time
import json

api_key = 'your-api-key'
api_secret = 'your-api-secret'
timestamp = str(int(time.time() * 1000))
method = 'POST'
path = '/v1/payments'
body = json.dumps({
    'amount': '100.00',
    'currency': 'USD',
    'description': 'Test payment',
    'redirect_url': 'https://yoursite.com/success',
    'webhook_url': 'https://yoursite.com/webhook'
})

def generate_signature(secret, timestamp, method, path, body):
    message = f'{timestamp}{method}{path}{body}'
    return hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()

signature = generate_signature(api_secret, timestamp, method, path, body)

response = requests.post(
    'https://api.bitxpay.com/v1/payments',
    headers={
        'X-API-Key': api_key,
        'X-Signature': signature,
        'X-Timestamp': timestamp,
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
app.use(express.json());

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-bitxpay-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', 'your-webhook-secret')
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  const event = req.body;
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
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Bitxpay-Signature')
    payload = request.get_data()
    
    # Verify webhook signature
    expected_signature = hmac.new(
        b'your-webhook-secret',
        payload,
        hashlib.sha256
    ).hexdigest()
    
    if signature != expected_signature:
        return 'Invalid signature', 401
    
    # Process the webhook
    event = request.json
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

- **Sandbox API**: `https://sandbox-api.bitxpay.com`
- **Sandbox Dashboard**: `https://sandbox.bitxpay.com`

Use sandbox credentials to test your integration without real funds.

## Next steps

Now that you've created your first payment, explore more features:

- [Authentication](/get-started/authentication) - Learn about security best practices
- [Webhooks](/integration/webhooks) - Deep dive into webhook events
- [SDKs and Libraries](/get-started/sdks-libraries) - Use our official SDKs
- [API Reference](/api-reference/) - Explore all available endpoints

## Common issues

### Invalid signature error

Make sure you're:
- Using the correct API secret
- Including the timestamp in the signature
- Formatting the message string correctly: `${timestamp}${method}${path}${body}`

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
