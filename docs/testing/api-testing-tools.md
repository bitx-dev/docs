---
title: API Testing Tools
description: Test BitXPay APIs using various tools including cURL, Insomnia, HTTPie, and more.
---

# API Testing Tools

While Postman is our recommended tool, you can test BitXPay APIs using various other tools. This guide covers popular alternatives with RSA-PSS signature generation examples.

## cURL

cURL is a command-line tool available on most systems. Here's how to test with cURL using a helper script.

### Setup Script

Create a bash script `bitxpay-curl.sh`:

```bash
#!/bin/bash

# Configuration
API_KEY="your_api_key_here"
PRIVATE_KEY_FILE="private-key.pem"
BASE_URL="https://sandboxapi.bitxpay.com/api/v1"

# Get request details
METHOD=$1
ENDPOINT=$2
BODY=$3

# Generate timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Create message to sign
MESSAGE="${METHOD}${ENDPOINT}${TIMESTAMP}${BODY}"

# Generate signature using OpenSSL
SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -sign "$PRIVATE_KEY_FILE" -sigopt rsa_padding_mode:pss -sigopt rsa_pss_saltlen:32 | base64 -w 0)

# Make request
if [ -z "$BODY" ]; then
  curl -X "$METHOD" "${BASE_URL}${ENDPOINT}" \
    -H "X-API-Key: $API_KEY" \
    -H "X-API-Signature: $SIGNATURE" \
    -H "X-API-Timestamp: $TIMESTAMP" \
    -H "Content-Type: application/json"
else
  curl -X "$METHOD" "${BASE_URL}${ENDPOINT}" \
    -H "X-API-Key: $API_KEY" \
    -H "X-API-Signature: $SIGNATURE" \
    -H "X-API-Timestamp: $TIMESTAMP" \
    -H "Content-Type: application/json" \
    -d "$BODY"
fi
```

### Usage

```bash
chmod +x bitxpay-curl.sh

# Create payment link
./bitxpay-curl.sh POST /payments/links '{"merchant_key":"mkey-xxx","order_currency":"USD","order_amount":10,"payment_name":"Test","payer_email":"test@example.com","success_url":"https://example.com/success","cancel_url":"https://example.com/cancel"}'

# Get payment details
./bitxpay-curl.sh GET /payments/links/payment-id-here
```

### Node.js Helper for cURL

If OpenSSL version doesn't support PSS, use this Node.js helper:

```javascript
#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

const apiKey = process.env.MERCHANT_API_KEY;
const privateKey = fs.readFileSync('private-key.pem', 'utf8');
const baseUrl = 'https://sandboxapi.bitxpay.com/api/v1';

const [method, endpoint, body = ''] = process.argv.slice(2);
const timestamp = new Date().toISOString();
const message = `${method}${endpoint}${timestamp}${body}`;

const signature = crypto.sign('sha256', Buffer.from(message, 'utf8'), {
  key: privateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  saltLength: 32
}).toString('base64');

const curlCmd = body
  ? `curl -X ${method} "${baseUrl}${endpoint}" -H "X-API-Key: ${apiKey}" -H "X-API-Signature: ${signature}" -H "X-API-Timestamp: ${timestamp}" -H "Content-Type: application/json" -d '${body}'`
  : `curl -X ${method} "${baseUrl}${endpoint}" -H "X-API-Key: ${apiKey}" -H "X-API-Signature: ${signature}" -H "X-API-Timestamp: ${timestamp}"`;

console.log(execSync(curlCmd).toString());
```

Save as `bitxpay-request.js` and use:

```bash
chmod +x bitxpay-request.js
./bitxpay-request.js POST /payments/links '{"merchant_key":"mkey-xxx",...}'
```

---

## Insomnia

Insomnia is a modern REST client with a clean interface.

### Setup

1. **Install Insomnia** from [insomnia.rest](https://insomnia.rest/)
2. **Create a new Request Collection**
3. **Set up Environment Variables**

### Environment Variables

Create an environment with:

```json
{
  "base_url": "https://sandboxapi.bitxpay.com/api/v1",
  "api_key": "your_api_key",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----"
}
```

### Pre-Request Script

Insomnia supports plugins. Install the **insomnia-plugin-request-hooks** plugin:

1. Go to **Preferences** → **Plugins**
2. Search for "request-hooks"
3. Install the plugin

Create a hook file `.insomnia/hooks.js`:

```javascript
const crypto = require('crypto');

module.exports.requestHooks = [
  (context) => {
    const { request } = context;
    const privateKey = context.environment.private_key;
    const apiKey = context.environment.api_key;
    
    const method = request.getMethod();
    const url = new URL(request.getUrl());
    const path = url.pathname;
    const timestamp = new Date().toISOString();
    const body = request.getBodyText() || '';
    
    const message = `${method}${path}${timestamp}${body}`;
    
    const signature = crypto.sign('sha256', Buffer.from(message, 'utf8'), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: 32
    }).toString('base64');
    
    request.setHeader('X-API-Key', apiKey);
    request.setHeader('X-API-Signature', signature);
    request.setHeader('X-API-Timestamp', timestamp);
  }
];
```

### Manual Signature (Alternative)

If you prefer not to use plugins, generate signatures externally and paste them:

1. Use the Node.js script above to generate signature
2. Copy the signature value
3. Manually add headers in Insomnia

---

## HTTPie

HTTPie is a user-friendly command-line HTTP client.

### Installation

```bash
# macOS
brew install httpie

# Ubuntu/Debian
apt install httpie

# Python pip
pip install httpie
```

### Usage with Helper Script

Create `bitxpay-http.sh`:

```bash
#!/bin/bash

API_KEY="your_api_key"
PRIVATE_KEY_FILE="private-key.pem"
BASE_URL="https://sandboxapi.bitxpay.com/api/v1"

METHOD=$1
ENDPOINT=$2
BODY=$3

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
MESSAGE="${METHOD}${ENDPOINT}${TIMESTAMP}${BODY}"

SIGNATURE=$(echo -n "$MESSAGE" | openssl dgst -sha256 -sign "$PRIVATE_KEY_FILE" -sigopt rsa_padding_mode:pss -sigopt rsa_pss_saltlen:32 | base64 -w 0)

if [ -z "$BODY" ]; then
  http "$METHOD" "${BASE_URL}${ENDPOINT}" \
    "X-API-Key:$API_KEY" \
    "X-API-Signature:$SIGNATURE" \
    "X-API-Timestamp:$TIMESTAMP"
else
  echo "$BODY" | http "$METHOD" "${BASE_URL}${ENDPOINT}" \
    "X-API-Key:$API_KEY" \
    "X-API-Signature:$SIGNATURE" \
    "X-API-Timestamp:$TIMESTAMP"
fi
```

### Example

```bash
chmod +x bitxpay-http.sh

# Create payment
./bitxpay-http.sh POST /payments/links '{"merchant_key":"mkey-xxx","order_amount":10,...}'
```

---

## REST Client (VS Code Extension)

REST Client is a VS Code extension that lets you test APIs directly in your editor.

### Installation

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "REST Client"
4. Install by Huachao Mao

### Setup

Create a file `bitxpay-requests.http`:

```http
### Variables
@baseUrl = https://sandboxapi.bitxpay.com/api/v1
@apiKey = your_api_key_here

### Create Payment Link
# @name createPayment
POST {{baseUrl}}/payments/links
X-API-Key: {{apiKey}}
X-API-Signature: {{$processEnv SIGNATURE}}
X-API-Timestamp: {{$processEnv TIMESTAMP}}
Content-Type: application/json

{
  "merchant_key": "mkey-xxx",
  "order_currency": "USD",
  "order_amount": 10,
  "payment_name": "Test Payment",
  "payer_email": "test@example.com",
  "success_url": "https://example.com/success",
  "cancel_url": "https://example.com/cancel"
}

### Get Payment Details
GET {{baseUrl}}/payments/links/{{createPayment.response.body.payment_reference}}
X-API-Key: {{apiKey}}
X-API-Signature: {{$processEnv SIGNATURE}}
X-API-Timestamp: {{$processEnv TIMESTAMP}}
```

**Note:** You'll need to generate `SIGNATURE` and `TIMESTAMP` environment variables externally using the Node.js script.

---

## Thunder Client (VS Code Extension)

Thunder Client is a lightweight REST client for VS Code.

### Installation

1. Open VS Code
2. Install "Thunder Client" extension
3. Open Thunder Client from the sidebar

### Setup

1. **Create Environment**
   - Click "Env" tab
   - Add variables: `base_url`, `api_key`, `private_key`

2. **Pre-Request Script**
   
   Thunder Client supports JavaScript in pre-request scripts:

   ```javascript
   const crypto = require('crypto');
   
   const apiKey = tc.getVar('api_key');
   const privateKey = tc.getVar('private_key');
   const method = tc.request.method;
   const url = new URL(tc.request.url);
   const path = url.pathname;
   const timestamp = new Date().toISOString();
   const body = tc.request.body || '';
   
   const message = `${method}${path}${timestamp}${body}`;
   
   const signature = crypto.sign('sha256', Buffer.from(message, 'utf8'), {
     key: privateKey,
     padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
     saltLength: 32
   }).toString('base64');
   
   tc.setVar('signature', signature);
   tc.setVar('timestamp', timestamp);
   ```

3. **Add Headers**
   - `X-API-Key`: `{{api_key}}`
   - `X-API-Signature`: `{{signature}}`
   - `X-API-Timestamp`: `{{timestamp}}`

---

## Python Requests

For Python developers, here's a reusable class:

```python
import os
import json
import base64
from datetime import datetime
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
import requests

class BitXPayClient:
    def __init__(self, api_key, private_key_path, base_url=None):
        self.api_key = api_key
        self.base_url = base_url or 'https://sandboxapi.bitxpay.com/api/v1'
        
        with open(private_key_path, 'r') as f:
            self.private_key = serialization.load_pem_private_key(
                f.read().encode(),
                password=None,
                backend=default_backend()
            )
    
    def _generate_signature(self, method, path, timestamp, body=''):
        message = f"{method}{path}{timestamp}{body}"
        
        signature = self.private_key.sign(
            message.encode('utf-8'),
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=32
            ),
            hashes.SHA256()
        )
        
        return base64.b64encode(signature).decode('utf-8')
    
    def request(self, method, path, data=None):
        timestamp = datetime.utcnow().isoformat() + 'Z'
        body = json.dumps(data) if data else ''
        
        signature = self._generate_signature(method, path, timestamp, body)
        
        headers = {
            'X-API-Key': self.api_key,
            'X-API-Signature': signature,
            'X-API-Timestamp': timestamp,
            'Content-Type': 'application/json'
        }
        
        url = f"{self.base_url}{path}"
        
        response = requests.request(
            method,
            url,
            headers=headers,
            data=body if body else None
        )
        
        return response.json()
    
    def create_payment_link(self, payment_data):
        return self.request('POST', '/payments/links', payment_data)
    
    def get_payment(self, payment_id):
        return self.request('GET', f'/payments/links/{payment_id}')
    
    def update_payment_status(self, payment_id, status):
        return self.request('PATCH', f'/payments/links/{payment_id}', {'status': status})

# Usage
client = BitXPayClient(
    api_key=os.environ['MERCHANT_API_KEY'],
    private_key_path='private-key.pem'
)

payment = client.create_payment_link({
    'merchant_key': 'mkey-xxx',
    'order_currency': 'USD',
    'order_amount': 10,
    'payment_name': 'Test Payment',
    'payer_email': 'test@example.com',
    'success_url': 'https://example.com/success',
    'cancel_url': 'https://example.com/cancel'
})

print(payment)
```

---

## PHP Example

For PHP developers:

```php
<?php

class BitXPayClient {
    private $apiKey;
    private $privateKey;
    private $baseUrl;
    
    public function __construct($apiKey, $privateKeyPath, $baseUrl = null) {
        $this->apiKey = $apiKey;
        $this->privateKey = openssl_pkey_get_private(file_get_contents($privateKeyPath));
        $this->baseUrl = $baseUrl ?: 'https://sandboxapi.bitxpay.com/api/v1';
    }
    
    private function generateSignature($method, $path, $timestamp, $body = '') {
        $message = $method . $path . $timestamp . $body;
        
        openssl_sign(
            $message,
            $signature,
            $this->privateKey,
            [
                'digest_alg' => 'sha256',
                'padding' => OPENSSL_PKCS1_PSS_PADDING,
                'salt_length' => 32
            ]
        );
        
        return base64_encode($signature);
    }
    
    public function request($method, $path, $data = null) {
        $timestamp = gmdate('Y-m-d\TH:i:s\Z');
        $body = $data ? json_encode($data) : '';
        
        $signature = $this->generateSignature($method, $path, $timestamp, $body);
        
        $headers = [
            'X-API-Key: ' . $this->apiKey,
            'X-API-Signature: ' . $signature,
            'X-API-Timestamp: ' . $timestamp,
            'Content-Type: application/json'
        ];
        
        $ch = curl_init($this->baseUrl . $path);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        if ($body) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
        }
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    public function createPaymentLink($paymentData) {
        return $this->request('POST', '/payments/links', $paymentData);
    }
}

// Usage
$client = new BitXPayClient(
    getenv('MERCHANT_API_KEY'),
    'private-key.pem'
);

$payment = $client->createPaymentLink([
    'merchant_key' => 'mkey-xxx',
    'order_currency' => 'USD',
    'order_amount' => 10,
    'payment_name' => 'Test Payment',
    'payer_email' => 'test@example.com',
    'success_url' => 'https://example.com/success',
    'cancel_url' => 'https://example.com/cancel'
]);

print_r($payment);
```

---

## Comparison Table

| Tool | Difficulty | Automation | Best For |
|------|-----------|------------|----------|
| **Postman** | Easy | Excellent | Beginners, Teams |
| **Insomnia** | Easy | Good | Developers |
| **cURL** | Medium | Excellent | CI/CD, Scripts |
| **HTTPie** | Easy | Good | Command-line fans |
| **REST Client** | Easy | Good | VS Code users |
| **Thunder Client** | Easy | Good | Lightweight testing |
| **Python** | Medium | Excellent | Python projects |
| **PHP** | Medium | Excellent | PHP projects |

---

## Next Steps

- **[Postman Setup](/testing/postman-setup)** - Detailed Postman guide
- **[Troubleshooting](/testing/troubleshooting)** - Common issues
- **[API Reference](/api-reference/payments)** - Explore endpoints

## Support

Need help with a specific tool?

- **Email:** api-support@bitxpay.com
- **Documentation:** https://docs.bitxpay.com
