---
title: Troubleshooting
description: Common issues and solutions when testing BitXPay APIs.
---

# Troubleshooting Guide

This guide covers common issues you might encounter when testing BitXPay APIs and how to resolve them.

## Authentication Errors

### Error: "Missing or invalid access token"

**Error Response:**
```json
{
  "error": "unauthorized",
  "message": "Missing or invalid access token",
  "code": 401
}
```

**Possible Causes:**
1. API key not provided in headers
2. Incorrect header name
3. Invalid API key format

**Solutions:**

✅ **Check header name:**
- For merchant APIs: Use `X-API-Key` (not `Authorization`)
- For standard APIs: Use `Authorization: Bearer {token}`

✅ **Verify API key format:**
```
Correct: bknn_e552de1d1e0
Incorrect: Bearer bknn_e552de1d1e0 (for X-API-Key header)
```

✅ **Ensure key is active:**
- Log in to dashboard
- Check API Keys section
- Verify key status is "Active"

---

### Error: "Invalid signature"

**Error Response:**
```json
{
  "error": "unauthorized",
  "message": "Invalid signature",
  "code": 401
}
```

**Possible Causes:**
1. Incorrect private key
2. Wrong signature algorithm
3. Message format mismatch
4. Character encoding issues

**Solutions:**

✅ **Verify message format:**
```javascript
// Correct format
const message = `${METHOD}${PATH}${TIMESTAMP}${BODY}`;

// Example
"POST/payments/links2026-01-31T17:53:56Z{\"merchant_key\":\"mkey-xxx\"}"
```

✅ **Check signature parameters:**
- Algorithm: DSA (Digital Signature Algorithm)
- Hash: SHA-256
- Encoding: DER format
- Key size: 2048 bits minimum

✅ **Validate private key format:**
```
-----BEGIN DSA PRIVATE KEY-----
MIIBuwIBAAKBgQD...
(base64 encoded key)
...
-----END DSA PRIVATE KEY-----
```

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
const path = '/payments/links';
const timestamp = '2026-01-31T12:00:00Z';
const body = '{"test":"value"}';

// Expected message
const expectedMessage = 'POST/payments/links2026-01-31T12:00:00Z{"test":"value"}';

// Verify your message matches
console.assert(message === expectedMessage, 'Message format incorrect');
```

---

### Error: "Request timestamp is too old or invalid"

**Error Response:**
```json
{
  "error": "unauthorized",
  "message": "Request timestamp is too old or invalid",
  "code": 401
}
```

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
"2026-01-31 17:53:56"  // Wrong format
"1706721236"           // Unix timestamp (not supported for merchant APIs)
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
// Currency: 3-letter ISO 4217 code
order_currency: "USD" // ✅
order_currency: "usd" // ❌ (must be uppercase)
order_currency: "Dollar" // ❌

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
- Select your BitXPay environment

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
-----BEGIN DSA PRIVATE KEY-----\nMIIBuwIBAAKBgQD...\n-----END DSA PRIVATE KEY-----
```

**Option 2: Use actual newlines**
- In Postman, you can paste multi-line text directly
- The variable editor supports multi-line values

✅ **Remove extra spaces:**
```
// ❌ Wrong - extra spaces
-----BEGIN RSA PRIVATE KEY-----  
MIIEpAIBAAKCAQEA...

// ✅ Correct - no trailing spaces
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
```

✅ **Verify key markers:**
```
Correct: -----BEGIN DSA PRIVATE KEY-----
Also acceptable: -----BEGIN PRIVATE KEY----- (PKCS#8 format)
Wrong: -----BEGIN RSA PRIVATE KEY-----
```

---

## Network Issues

### Error: "Connection timeout"

**Solutions:**

✅ **Check internet connection**

✅ **Verify base URL:**
```
Sandbox: https://sandboxapi.bitxpay.com/api/v1
Production: https://api.bitxpay.com/api/v1
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

**Email:** api-support@bitxpay.com

**Include:**
- Detailed description of the issue
- Steps to reproduce
- Information gathered above
- Your merchant ID (not API key)

### 3. Check Status Page

**Status Page:** https://status.bitxpay.com

Check for any ongoing incidents or maintenance.

---

## Next Steps

- **[Postman Setup](/testing/postman-setup)** - Complete Postman guide
- **[API Testing Tools](/testing/api-testing-tools)** - Try other tools
- **[Authentication Reference](/api-reference/authentication)** - Deep dive into auth

## Support

- **Email:** api-support@bitxpay.com
- **Documentation:** https://docs.bitxpay.com
- **Status Page:** https://status.bitxpay.com
