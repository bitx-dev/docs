---
title: Troubleshooting
description: Common issues and solutions when testing BITXpay APIs.
---

# Troubleshooting Guide

This guide covers common issues you might encounter when testing BITXpay APIs and how to resolve them.

## Authentication Errors

### Error: "API key required" / "invalid API key"

**Error Response:**
```json
{
  "error": "unauthorized",
  "message": "API key required. Provide via X-API-Key header or Authorization header",
  "code": "API_KEY_REQUIRED"
}
```
or
```json
{
  "error": "unauthorized",
  "message": "invalid API key",
  "code": "INVALID_API_KEY"
}
```

**Possible Causes:**
1. API key not provided in headers
2. Incorrect header name
3. Invalid API key format

**Solutions:**

✅ **Check header name:**
- Use `X-API-Key: btxm_…` (or `Authorization: Bearer btxm_…`)

✅ **Verify API key format:**
```
Correct: btxm_9b451fa04a2e      (btxm_ + 12 hex characters)
```

✅ **Use the key in the environment that issued it:**
- A sandbox key only works against `{{ $api.sandbox.baseUrl }}`; a production key only against `{{ $api.production.baseUrl }}`. Otherwise you get `INVALID_API_KEY`.

✅ **Ensure key is active:**
- Log in to dashboard
- Check API Keys section
- Verify key status is "Active"

---

### Error: "signature verification failed"

**Error Response:**
```json
{
  "error": "unauthorized",
  "message": "signature verification failed: Ed25519 signature verification failed",
  "code": "SIGNATURE_VERIFICATION_FAILED",
  "debug": {
    "method": "POST",
    "path": "/api/v1/payment_links",
    "body_length": 71,
    "message_hash": ""
  }
}
```

The `debug` object shows the method, path and body length the **server** signed over. Compare them with what you signed.

**Possible Causes:**
1. Signed path missing the `/api/v1` prefix (by far the most common)
2. Body re-serialised by your HTTP client after signing (whitespace / key order changed)
3. Incorrect private key, or key loaded in the wrong format
4. Wrong signature algorithm

**Solutions:**

✅ **Verify message format:**
```javascript
// Correct format
const message = `${METHOD}${PATH}${TIMESTAMP}${BODY}`;

// Example — PATH includes /api/v1
"POST/api/v1/payment_links2026-01-31T17:53:56Z{\"payment_name\":\"Invoice #12345\",\"amount\":100.50,\"currency\":\"USDT\"}"
```

✅ **Check signature parameters:**
- Algorithm: Ed25519 (EdDSA)
- Hash: None (built into Ed25519)
- Encoding: raw signature bytes, base64-encoded
- Key format: `Ed25519:<base64 PKCS#8 DER>` as issued by the dashboard

✅ **Validate private key format:**
```
Ed25519:MC4CAQAwBQYDK2VwBCIEI...
```
Strip the `Ed25519:` prefix, base64-decode the rest and load it as a PKCS#8 **DER** key (`crypto.createPrivateKey({key, format: 'der', type: 'pkcs8'})` in Node, `load_der_private_key` in Python). Passing the raw string to a PEM loader fails.

✅ **Debug signature generation:**

Add logging to see what's being signed:

```javascript
console.log('Method:', method);
console.log('Path:', path);
console.log('Timestamp:', timestamp);
console.log('Body:', body);
console.log('Message:', message);
console.log('Signature:', signature.substring(0, 50) + '...');
```

✅ **Test with known values:**

Use this test case to verify your signature generation:

```javascript
// Test inputs
const method = 'POST';
const path = '/api/v1/payment_links';
const timestamp = '2026-01-31T12:00:00Z';
const body = '{"payment_name":"Invoice #12345","amount":100.50,"currency":"USDT"}';

// Expected message
const expectedMessage = 'POST/api/v1/payment_links2026-01-31T12:00:00Z{"payment_name":"Invoice #12345","amount":100.50,"currency":"USDT"}';

// Verify your message matches
console.assert(message === expectedMessage, 'Message format incorrect');
```

---

### Error: "request timestamp expired"

**Error Response:**
```json
{
  "error": "unauthorized",
  "message": "request timestamp expired. Maximum allowed time difference is 5 minutes",
  "code": "TIMESTAMP_EXPIRED",
  "time_diff_seconds": 360.4
}
```
(`INVALID_TIMESTAMP_FORMAT` if the value is not RFC 3339, `TIMESTAMP_REQUIRED` if the header is missing.)

**Possible Causes:**
1. System clock out of sync
2. Timestamp format incorrect
3. Request took longer than 5 minutes

**Solutions:**

✅ **Check timestamp format:**
```javascript
// Correct: ISO 8601 with Z suffix
const timestamp = new Date().toISOString(); // "2026-01-31T17:53:56.123Z"

// Also acceptable
const timestamp = "2026-01-31T17:53:56Z";

// Incorrect formats
"2026-01-31 17:53:56"  // Wrong: missing T and Z
"1706721236"           // Wrong: Unix timestamp not supported
"1706721236000"        // Wrong: milliseconds not supported
```

✅ **Synchronize system clock:**

**macOS/Linux:**
```bash
# Check current time
date -u

# Sync with NTP
sudo ntpdate -s time.apple.com
```

**Windows:**
```powershell
# Check time
Get-Date

# Sync with internet time
w32tm /resync
```

✅ **Generate fresh timestamp:**

Ensure timestamp is generated immediately before signing:

```javascript
// ✅ Correct - fresh timestamp
function makeRequest() {
  const timestamp = new Date().toISOString();
  const signature = generateSignature(method, path, timestamp, body);
  // Make request immediately
}

// ❌ Wrong - stale timestamp
const timestamp = new Date().toISOString();
// ... do other work ...
setTimeout(() => {
  const signature = generateSignature(method, path, timestamp, body);
  // Timestamp might be too old
}, 10000);
```

---

## Request Errors

### Error: "Validation failed"

**Error Response:**
```json
{
  "error": "invalid_request",
  "message": "Validation failed",
  "code": 400,
  "details": [
    {
      "field": "order_amount",
      "issue": "must be greater than 0"
    }
  ]
}
```

**Solutions:**

✅ **Check required fields:**

For Create Payment Link:
- `merchant_key` ✓
- `order_currency` ✓
- `order_amount` ✓
- `payment_name` ✓
- `payer_email` ✓
- `success_url` ✓
- `cancel_url` ✓

✅ **Validate field formats:**

```javascript
// Currency: any code from GET /payment_links/currencies (case-insensitive)
currency: "USDT" // ✅
currency: "usdt" // ✅ (normalised to USDT)
currency: "XYZ"  // ❌ 400 invalid currency code 'XYZ': currency not found

// Email: Valid email format
payer_email: "test@example.com" // ✅
payer_email: "test@example" // ❌
payer_email: "invalid-email" // ❌

// Amount: Positive number
order_amount: 10 // ✅
order_amount: 0 // ❌
order_amount: -5 // ❌
order_amount: "10" // ⚠️ (should be number, not string)

// URLs: Valid HTTP/HTTPS URLs
success_url: "https://example.com/success" // ✅
success_url: "example.com" // ❌ (missing protocol)
success_url: "ftp://example.com" // ❌ (must be HTTP/HTTPS)
```

---

### Error: "Payment link not found"

**Error Response:**
```json
{
  "error": "not_found",
  "message": "Payment link not found",
  "code": 404
}
```

**Solutions:**

✅ **Verify payment ID format:**
```javascript
// Correct: UUID format
"3d0a5e66-f5a5-432e-86e6-e9405a94fba6"

// Or payment reference format
"SDF-453672-PMT"
```

✅ **Check environment:**
- Sandbox payment IDs only work in sandbox
- Production payment IDs only work in production

✅ **Verify payment exists:**
- Use List Payment Links endpoint to see all payments
- Check if payment was created successfully

---

## Postman-Specific Issues

### Pre-Request Script Not Running

**Symptoms:**
- Headers not populated
- No console logs
- Signature not generated

**Solutions:**

✅ **Check script location:**
- Script should be in **Collection** pre-request, not individual request
- Go to Collection → Pre-request Script tab

✅ **Verify environment is selected:**
- Check dropdown in top-right corner
- Ensure correct environment is active

✅ **Check console for errors:**
- Open Postman Console (View → Show Postman Console)
- Look for JavaScript errors

✅ **Test forge library loading:**

Add this at the start of your script:

```javascript
console.log('Script started');
pm.sendRequest('https://cdn.jsdelivr.net/npm/node-forge@1.3.1/dist/forge.min.js', (err, res) => {
  if (err) {
    console.error('Failed to load forge:', err);
  } else {
    console.log('Forge loaded successfully');
  }
});
```

---

### Environment Variables Not Set

**Symptoms:**
- Error: "Missing MERCHANT_API_KEY or MERCHANT_PRIVATE_KEY"
- Variables show as `{{MERCHANT_API_KEY}}`

**Solutions:**

✅ **Check variable names (case-sensitive):**
```
Correct: MERCHANT_API_KEY
Wrong: merchant_api_key, Merchant_Api_Key
```

✅ **Verify environment is selected:**
- Click environment dropdown (top-right)
- Select your BITXpay environment

✅ **Check variable scope:**
- Variables should be in **Environment**, not Collection
- Click "Environments" in sidebar
- Select your environment
- Verify variables are listed

✅ **Check variable values:**
- Click eye icon next to environment dropdown
- Verify "Current Value" is populated
- If empty, click "Persist All" or manually set current values

---

### Private Key Format Issues

**Symptoms:**
- Error: "Invalid key format"
- Signature generation fails

**Solutions:**

✅ **Preserve newlines:**

**Option 1: Use `\n` for newlines**
```
-----BEGIN PRIVATE KEY-----\nMC4CAQAwBQYDK2VwBCIEIH...\n-----END PRIVATE KEY-----
```

**Option 2: Use actual newlines**
- In Postman, you can paste multi-line text directly
- The variable editor supports multi-line values

✅ **Remove extra spaces:**
```
// ❌ Wrong - extra spaces
-----BEGIN PRIVATE KEY-----  
MC4CAQAwBQYDK2VwBCIEIH...

// ✅ Correct - no trailing spaces
-----BEGIN PRIVATE KEY-----
MC4CAQAwBQYDK2VwBCIEIH...
```

✅ **Verify key markers:**
```
Correct: -----BEGIN PRIVATE KEY----- (PKCS#8 format for Ed25519)
Wrong: -----BEGIN DSA PRIVATE KEY-----
Wrong: -----BEGIN RSA PRIVATE KEY-----
```

---

## Network Issues

### Error: "Connection timeout"

**Solutions:**

✅ **Check internet connection**

✅ **Verify base URL:**
```
Sandbox: {{ $api.sandbox.baseUrl }}
Production: {{ $api.production.baseUrl }}
```

✅ **Check firewall/proxy settings:**
- Ensure HTTPS traffic is allowed
- Configure proxy in Postman if needed (Settings → Proxy)

✅ **Test API availability:**
```bash
curl -I https://sandboxapi.bitxpay.com/api/v1/health
```

---

### Error: "SSL certificate problem"

**Solutions:**

✅ **Update certificates:**
- Update your operating system
- Update Postman/tool to latest version

✅ **Temporary workaround (not recommended for production):**

In Postman:
- Settings → General → SSL certificate verification → OFF

⚠️ **Warning:** Only disable SSL verification for testing in sandbox. Never in production.

---

## Rate Limiting

### Error: "Too many requests"

**Error Response:**
```json
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests",
  "code": 429
}
```

**Rate Limits:**
- Sandbox: 100 requests/minute
- Production: 1000 requests/minute

**Solutions:**

✅ **Check rate limit headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1706721300
```

✅ **Implement retry logic:**
```javascript
async function makeRequestWithRetry(maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await makeRequest();
      return response;
    } catch (error) {
      if (error.code === 429) {
        const resetTime = error.headers['X-RateLimit-Reset'];
        const waitTime = (resetTime * 1000) - Date.now();
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        throw error;
      }
    }
  }
}
```

✅ **Reduce request frequency:**
- Add delays between requests
- Batch operations when possible
- Cache responses

---

## Debugging Checklist

When encountering issues, go through this checklist:

### 1. Environment Setup
- [ ] Correct environment selected
- [ ] API key is valid and active
- [ ] Private key is in correct format
- [ ] Base URL is correct (sandbox vs production)

### 2. Request Format
- [ ] HTTP method is correct (POST, GET, PATCH)
- [ ] Endpoint path is correct
- [ ] Headers are properly set
- [ ] Body is valid JSON (for POST/PATCH)

### 3. Authentication
- [ ] Timestamp is in ISO 8601 format
- [ ] Timestamp is recent (within 5 minutes)
- [ ] Signature message format is correct
- [ ] Signature algorithm parameters are correct

### 4. Console Logs
- [ ] Check Postman Console for errors
- [ ] Verify signature generation logs
- [ ] Check for network errors

### 5. Response Analysis
- [ ] Read error message carefully
- [ ] Check error code
- [ ] Review error details array

---

## Getting Help

If you're still experiencing issues:

### 1. Gather Information

Collect the following:
- Request method and endpoint
- Request headers (redact sensitive values)
- Request body (redact sensitive data)
- Response status code
- Response body
- Console logs (if using Postman)

### 2. Contact Support

**Email:** {{ $site.urls.support.email }}

**Include:**
- Detailed description of the issue
- Steps to reproduce
- Information gathered above
- Your merchant ID (not API key)

### 3. Check Status Page

<!-- **Status Page:** {{ $site.urls.support.statusPage }} -->

Check for any ongoing incidents or maintenance.

---

## Next Steps

- **[Postman Setup](/testing/postman-setup)** - Complete Postman guide
- **[API Testing Tools](/testing/api-testing-tools)** - Try other tools
- **[Authentication Reference](/api-reference/authentication)** - Deep dive into auth

## Support

- **Email:** {{ $site.urls.support.email }}
- **Documentation:** {{ $site.urls.support.documentation }}
<!-- - **Status Page:** {{ $site.urls.support.statusPage }} -->
