---
title: Postman Setup Guide
description: Complete guide to configure Postman for testing BitXPay merchant APIs with Ed25519 signature authentication.
---

# Postman Setup Guide

This guide will walk you through setting up Postman to test BitXPay merchant-facing APIs with automatic Ed25519 signature generation.

## Prerequisites

- [Postman](https://www.postman.com/downloads/) installed (Desktop or Web)
- Merchant API Key
- Merchant Private Key (Ed25519 format)

## Quick Setup (3 Steps)

### Step 1: Create a New Environment

1. Open Postman
2. Click **Environments** in the left sidebar
3. Click **Create Environment** (+ button)
4. Name it `BitXPay Sandbox` or `BitXPay Production`

### Step 2: Configure Environment Variables

Add the following variables to your environment:

| Variable Name | Type | Initial Value | Current Value |
|--------------|------|---------------|---------------|
| `BASE_URL` | default | `https://sandboxapi.bitxpay.com/api/v1` | (same) |
| `MERCHANT_API_KEY` | default | `bknn_e552de1d1e0` | Your API key |
| `MERCHANT_PRIVATE_KEY` | secret | `Ed25519:base64_encoded_pkcs8_key` | Your private key |
| `X_API_KEY` | default | (leave empty) | (auto-generated) |
| `X_API_SIGNATURE` | default | (leave empty) | (auto-generated) |
| `X_API_TIMESTAMP` | default | (leave empty) | (auto-generated) |

::: tip
The last three variables (`X_API_KEY`, `X_API_SIGNATURE`, `X_API_TIMESTAMP`) will be automatically populated by the pre-request script.
:::

#### How to Add Your Private Key

Your private key should be in Ed25519:base64 format:

```
Ed25519:MC4CAQAwBQYDK2VwBCIEIE8VdFJvfWXyGKm9...base64_encoded_pkcs8_key
```

**Important:** The key must start with `Ed25519:` prefix followed by the base64-encoded PKCS8 private key.

### Step 3: Add Pre-Request Script

1. Create a new **Collection** (e.g., "BitXPay Merchant APIs")
2. Click on the collection name
3. Go to the **Pre-request Script** tab
4. Paste the following script:

```javascript
// ============================================
// BITXpay Merchant API - Ed25519 Signature
// ============================================

new Promise((resolve, reject) => {
    const forgeUrl = 'https://cdn.jsdelivr.net/npm/node-forge@1.3.1/dist/forge.min.js';
    const ed25519Url = 'https://cdn.jsdelivr.net/npm/@noble/ed25519@1.7.3/+esm';

    // Load forge first
    pm.sendRequest(forgeUrl, (err, res) => {
        if (err) {
            console.error('❌ Failed to load forge:', err);
            reject(err);
            return;
        }

        try {
            // Mock browser globals and capture forge
            var window = {};
            var self = window;
            var document = {};
            
            // Wrap and execute forge to capture exports
            const forgeCode = res.text();
            const wrappedCode = `
                (function(window, self, document) {
                    ${forgeCode}
                    return window.forge || forge;
                })(window, self, document)
            `;
            
            const forge = eval(wrappedCode);

            const apiKey = pm.environment.get("MERCHANT_API_KEY");
            const privateKeyFormatted = pm.environment.get("MERCHANT_PRIVATE_KEY");

            if (!apiKey || !privateKeyFormatted) {
                throw new Error("❌ Missing MERCHANT_API_KEY or MERCHANT_PRIVATE_KEY");
            }

            // Check if private key is in Ed25519:base64 format
            if (!privateKeyFormatted.startsWith("Ed25519:")) {
                throw new Error("❌ Private key must be in Ed25519:base64 format");
            }

            const method = pm.request.method;
            const path = pm.request.url.getPath();
            const timestamp = new Date().toISOString();
            const body = pm.request.body ? pm.request.body.raw || '' : '';

            const message = `${method}${path}${timestamp}${body}`;

            console.log('🔐 Signing:', method, path);
            console.log('  Timestamp:', timestamp);
            console.log('  API Key:', apiKey);

            // Extract base64 part from Ed25519:base64 format
            const base64PrivateKey = privateKeyFormatted.substring(8); // Remove "Ed25519:" prefix
            
            // Decode the PKCS8 private key using forge
            const pkcs8Bytes = forge.util.decode64(base64PrivateKey);
            const pkcs8Der = forge.util.createBuffer(pkcs8Bytes, 'raw');
            
            // Parse PKCS8 DER to extract Ed25519 seed
            const asn1 = forge.asn1.fromDer(pkcs8Der);
            
            // Navigate ASN.1 structure: SEQUENCE -> PrivateKey OctetString
            const privateKeyOctetString = asn1.value[2]; // Third element contains the private key
            const privateKeyBytes = privateKeyOctetString.value;
            
            // Parse inner OCTET STRING to get the actual 32-byte seed
            const innerAsn1 = forge.asn1.fromDer(forge.util.createBuffer(privateKeyBytes, 'raw'));
            const seedBytes = innerAsn1.value;

            // Convert seed to Uint8Array
            const seedArray = new Uint8Array(32);
            for (let i = 0; i < 32; i++) {
                seedArray[i] = seedBytes.charCodeAt(i) & 0xff;
            }

            // Manual Ed25519 signing using pure JavaScript
            // Since we can't load external Ed25519 libraries easily, let's use a different approach
            // We'll use the tweetnacl standalone version
            
            const tweetnaclStandaloneUrl = 'https://cdn.jsdelivr.net/npm/tweetnacl@1.0.3/nacl-fast.js';
            
            pm.sendRequest(tweetnaclStandaloneUrl, (err2, res2) => {
                if (err2) {
                    console.error('❌ Failed to load tweetnacl:', err2);
                    reject(err2);
                    return;
                }

                try {
                    // Clean the response to avoid 'use strict' issues
                    let tweetnaclCode = res2.text();
                    
                    // Remove any 'use strict' at the top that might cause issues
                    tweetnaclCode = tweetnaclCode.replace(/['"]use strict['"];?\s*/g, '');
                    
                    // Wrap in IIFE to avoid global scope pollution
                    const wrappedNacl = `
                        (function() {
                            var window = window || {};
                            var self = window;
                            var document = {};
                            var global = window;
                            var crypto = undefined;
                            var require = undefined;
                            var module = { exports: {} };
                            var exports = module.exports;
                            
                            ${tweetnaclCode}
                            
                            return module.exports || window.nacl || nacl;
                        })()
                    `;
                    
                    const nacl = eval(wrappedNacl);

                    // Generate Ed25519 keypair from seed
                    const keyPair = nacl.sign.keyPair.fromSeed(seedArray);

                    // Convert message string to Uint8Array
                    const messageArray = new Uint8Array(message.length);
                    for (let i = 0; i < message.length; i++) {
                        messageArray[i] = message.charCodeAt(i);
                    }

                    // Sign the message with Ed25519
                    const signature = nacl.sign.detached(messageArray, keyPair.secretKey);

                    // Convert signature Uint8Array to base64 using forge
                    let sigBytes = '';
                    for (let i = 0; i < signature.length; i++) {
                        sigBytes += String.fromCharCode(signature[i]);
                    }
                    const signatureBase64 = forge.util.encode64(sigBytes);

                    console.log('✅ Signature:', signatureBase64.substring(0, 50) + '...');

                    pm.environment.set("X_API_KEY", apiKey);
                    pm.environment.set("X_API_SIGNATURE", signatureBase64);
                    pm.environment.set("X_API_TIMESTAMP", timestamp);

                    // pm.request.headers.upsert({ key: 'X-API-Key', value: apiKey });
                    // pm.request.headers.upsert({ key: 'X-API-Signature', value: signatureBase64 });
                    // pm.request.headers.upsert({ key: 'X-API-Timestamp', value: timestamp });

                    resolve();

                } catch (error) {
                    console.error('❌ Error during Ed25519 signing:', error.message);
                    console.error('Stack:', error.stack);
                    reject(error);
                }
            });

        } catch (error) {
            console.error('❌ Error parsing private key:', error.message);
            console.error('Stack:', error.stack);
            reject(error);
        }
    });
});
```

5. Click **Save**

## Understanding the Script

### What It Does

The pre-request script automatically:

1. **Loads cryptographic libraries** - node-forge for ASN.1 parsing and TweetNaCl for Ed25519 signing
2. **Parses the private key** - Extracts the 32-byte seed from PKCS8 format
3. **Constructs the signature message** - Combines `METHOD + PATH + TIMESTAMP + BODY`
4. **Signs the message** - Uses Ed25519 signature algorithm (64-byte signature)
5. **Encodes the signature** - Converts to Base64
6. **Sets environment variables** - Populates `X_API_KEY`, `X_API_SIGNATURE`, and `X_API_TIMESTAMP`

### Signature Components

```
Message = METHOD + PATH + TIMESTAMP + BODY
```

**Example:**
```
POST/payments/links2026-01-31T17:53:56Z{"merchant_key":"mkey-xxx","order_amount":10}
```

This message is then signed using:
- **Algorithm:** Ed25519 (Edwards-curve Digital Signature Algorithm)
- **Curve:** Curve25519
- **Signature Size:** 64 bytes (fixed)
- **Key Size:** 32 bytes (256 bits)
- **Libraries:** TweetNaCl for signing, node-forge for key parsing

## Creating Your First Request

### 1. Create Payment Link Request

1. In your collection, click **Add Request**
2. Name it "Create Payment Link"
3. Set method to **POST**
4. Set URL to: `{{BASE_URL}}/payments/links`
5. Go to **Headers** tab and add:

| Key | Value |
|-----|-------|
| `Content-Type` | `application/json` |
| `X-API-Key` | `{{X_API_KEY}}` |
| `X-API-Signature` | `{{X_API_SIGNATURE}}` |
| `X-API-Timestamp` | `{{X_API_TIMESTAMP}}` |

6. Go to **Body** tab, select **raw** and **JSON**, then paste:

```json
{
  "merchant_key": "mkey-ckfhqahxy04g6e4qs6t3f00nl",
  "order_currency": "USD",
  "order_amount": 10,
  "payment_name": "Test Payment",
  "payer_email": "test@example.com",
  "success_url": "https://example.com/success",
  "cancel_url": "https://example.com/cancel"
}
```

7. Click **Send**

### Expected Response

```json
{
  "payment_reference": "SDF-453672-PMT",
  "name": "Test Payment",
  "order_currency": "USD",
  "order_amount": 10,
  "payment_status": "processing",
  "expiry_date": "2026-02-01T03:57:22Z",
  "hosted_url": "https://pay.bitxpay.com/link/SDF-453672-PMT",
  "token_type": "x-api-key",
  "expires_in": 1499,
  "is_active": true,
  "max_uses": 1,
  "current_uses": 0,
  "notify_secret": "Cf9mx4nAvRuy5vwBY2FCtaKr"
}
```

## Viewing Console Logs

To see the signature generation process:

1. Click **Console** at the bottom of Postman (or View → Show Postman Console)
2. Send a request
3. You'll see logs like:

```
🔐 Signing: POST /payments/links
  Timestamp: 2026-01-31T17:53:56Z
✅ Signature: CHJRTWpRdJ4Wqo8AoGE4QQ0FnQIUJQSWt0YmWyqZZq4J...
```

## Testing Other Endpoints

### Get Payment Details

```
Method: GET
URL: {{BASE_URL}}/payments/links/{{payment_id}}
Headers: Same as above (X-API-Key, X-API-Signature, X-API-Timestamp)
Body: None
```

### Update Payment Status

```
Method: PATCH
URL: {{BASE_URL}}/payments/links/{{payment_id}}
Headers: Same as above
Body:
{
  "id": "b8b2362d-f30c-4d9b-9a2e-08fa183d0d49",
  "status": "expired"
}
```

### List Payment Links

```
Method: GET
URL: {{BASE_URL}}/payments/links?page=1&page_size=20
Headers: Authorization: Bearer {{MERCHANT_API_KEY}}
Body: None
```

::: warning
Note: The List endpoint uses Bearer token authentication instead of X-API-Key.
:::

## Advanced Configuration

### Multiple Environments

Create separate environments for different stages:

1. **BitXPay Sandbox**
   - `BASE_URL`: `https://sandboxapi.bitxpay.com/api/v1`
   - Use sandbox API keys

2. **BitXPay Production**
   - `BASE_URL`: `https://api.bitxpay.com/api/v1`
   - Use production API keys

Switch between environments using the dropdown in the top-right corner.

### Collection Variables

For values used across all requests in a collection:

1. Click on your collection
2. Go to **Variables** tab
3. Add common values (e.g., `merchant_key`)

### Saving Responses

To save a payment ID for subsequent requests:

1. Go to the **Tests** tab of your "Create Payment Link" request
2. Add this script:

```javascript
const response = pm.response.json();
pm.environment.set("payment_id", response.payment_reference);
```

Now you can use `{{payment_id}}` in other requests.

## Troubleshooting

### Error: "Missing MERCHANT_API_KEY or MERCHANT_PRIVATE_KEY"

**Solution:** Ensure your environment variables are set correctly and the environment is selected.

### Error: "Invalid signature"

**Possible causes:**
1. **Incorrect private key format** - Must be in `Ed25519:base64` format
2. **Missing Ed25519 prefix** - Key must start with `Ed25519:`
3. **Key mismatch** - The private key must match the public key associated with your API key
4. **Timestamp issues** - Check your system clock is synchronized
5. **Library loading failure** - Check console for CDN errors

**Debug steps:**
1. Open Postman Console
2. Check the signature generation logs
3. Verify the message being signed matches: `METHOD + PATH + TIMESTAMP + BODY`

### Error: "Timestamp expired"

**Solution:** Timestamps are valid for 5 minutes. If you see this error:
1. Your system clock may be incorrect
2. You may have left a request open too long before sending

The pre-request script generates a fresh timestamp each time, so simply resend the request.

### Script Not Running

**Solution:**
1. Ensure the script is in the **Collection** pre-request script, not individual request
2. Check Postman Console for JavaScript errors
3. Verify you have internet access (script loads node-forge and TweetNaCl from CDN)
4. Check that both libraries loaded successfully in the console logs

### Private Key Format Issues

If your private key has issues, ensure it's formatted correctly:

**Correct format:**
```
Ed25519:MC4CAQAwBQYDK2VwBCIEIE8VdFJvfWXyGKm9base64encodedkey
```

**Format explanation:**
- Prefix: `Ed25519:`
- Followed by: Base64-encoded PKCS8 private key
- No newlines or spaces in the base64 part

## Downloadable Resources

### Postman Collection

Download our pre-configured Postman collection:

[Download BitXPay Collection](./assets/bitxpay-collection.json) *(Coming soon)*

### Environment Template

Download the environment template:

[Download Environment Template](./assets/bitxpay-environment.json) *(Coming soon)*

## Next Steps

- **[Explore API Endpoints](/api-reference/payments)** - Learn about all available APIs
- **[Test with Other Tools](/testing/api-testing-tools)** - Try cURL, Insomnia, etc.
- **[Troubleshooting Guide](/testing/troubleshooting)** - Solve common issues

## Support

Need help with Postman setup?

- **Email:** api-support@bitxpay.com
- **Documentation:** https://docs.bitxpay.com
