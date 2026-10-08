import crypto from 'crypto';

// Load the private key exactly as the dashboard issued it:
//   "Ed25519:<base64 PKCS#8 DER>"  (current keys)
//   "-----BEGIN PRIVATE KEY-----"  (legacy RSA keys, PEM)
function loadPrivateKey(raw) {
  raw = raw.trim();
  if (raw.startsWith('Ed25519:')) {
    return crypto.createPrivateKey({
      key: Buffer.from(raw.slice('Ed25519:'.length), 'base64'),
      format: 'der',
      type: 'pkcs8',
    });
  }
  return crypto.createPrivateKey(raw);
}

// message = METHOD + PATH + TIMESTAMP + BODY  (no separators)
// PATH is the full request path, including the /api/v1 prefix.
function sign(privateKey, method, path, timestamp, body = '') {
  const message = `${method}${path}${timestamp}${body}`;
  if (privateKey.asymmetricKeyType === 'ed25519') {
    // Ed25519 hashes internally: algorithm must be null, do not pre-hash.
    return crypto.sign(null, Buffer.from(message, 'utf8'), privateKey).toString('base64');
  }
  // Legacy RSA keys: RSA-PSS with SHA-256, salt length = digest length.
  return crypto
    .sign('sha256', Buffer.from(message, 'utf8'), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
      saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST,
    })
    .toString('base64');
}

// Usage
const apiKey = process.env.MERCHANT_API_KEY;               // btxm_xxxxxxxxxxxx
const privateKey = loadPrivateKey(process.env.MERCHANT_PRIVATE_KEY); // Ed25519:MC4CAQAw...

const host = 'https://sandboxapi.bitxpay.com';
const path = '/api/v1/payment_links';                       // sign the FULL path
const method = 'POST';
const timestamp = new Date().toISOString();                 // RFC 3339, UTC
const body = JSON.stringify({
  payment_name: 'Invoice #12345',
  amount: 100.5,
  currency: 'USDT',
  customer_email: 'john@example.com',
  success_url: 'https://example.com/success',
  cancel_url: 'https://example.com/cancel',
});

const signature = sign(privateKey, method, path, timestamp, body);

const response = await fetch(host + path, {
  method,
  headers: {
    'X-API-Key': apiKey,
    'X-API-Signature': signature,
    'X-API-Timestamp': timestamp,
    'Content-Type': 'application/json',
  },
  body, // send the exact string that was signed
});
console.log(response.status, await response.json());
