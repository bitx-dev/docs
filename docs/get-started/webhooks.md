# Webhooks

BITXpay Merchant Platform supports webhook subscriptions across several products, all using the same underlying API and authentication. Use webhooks to receive real-time HTTP notifications when events happen onchain, in your wallets, or across your BITXpay accounts.

## Getting started

Before you get started, ensure you have:

### A Secret API Key

1. Sign up at [sandbox.bitxpay.com/auth/signup](https://sandbox.bitxpay.com/auth/signup)
2. Navigate to **API Keys**
3. Select **Create API key** under the Secret API Keys tab
4. Enter an API key nickname (restrictions are optional)
5. Click **Create**
6. Secure your API Key ID and Secret in a safe location

### A webhook URL

You'll need an HTTPS URL to receive webhook events. 

- **For quick testing**: [webhook.site](https://webhook.site) gives free temporary URLs instantly
- **For production**: Use your own HTTPS endpoint

### BITXpay CLI (Optional)

Install the BITXpay CLI to make authenticated requests to BITXpay APIs:

```bash
# With npm
npm install -g @bitxpay/cli

# Or with pip
pip install bitxpay-cli
```

## Webhook Events

BITXpay sends webhook notifications for the following event types:

### Payment Events

| Event Type | Description |
|------------|-------------|
| `payment.created` | A new payment has been created |
| `payment.pending` | Payment is awaiting blockchain confirmation |
| `payment.completed` | Payment has been confirmed on-chain |
| `payment.failed` | Payment has failed or expired |
| `payment.refunded` | Payment has been refunded |

### Transfer Events

| Event Type | Description |
|------------|-------------|
| `transfer.initiated` | A transfer has been initiated |
| `transfer.completed` | Transfer has been confirmed |
| `transfer.failed` | Transfer has failed |

### Wallet Events

| Event Type | Description |
|------------|-------------|
| `wallet.deposit` | Funds deposited to wallet |
| `wallet.withdrawal` | Funds withdrawn from wallet |

## Subscribe by product

Webhook support is actively expanding across BITXpay products. Check back as more integrations are added.

### Onchain Data
Monitor smart contract events and token transfers on supported networks.

### Server Wallets
Track transfer activity in and out of your BITXpay Server Wallet addresses.

### Embedded Wallets
Track transfer activity on your users' wallets using Onchain Data Webhooks. Native Embedded Wallet webhook support is coming soon.

### Onramp & Offramp
Receive real-time status updates for your users' buy and sell transactions.

## Webhook Payload Structure

All webhooks follow a consistent structure:

```json
{
  "id": "evt_1234567890",
  "type": "payment.completed",
  "created_at": "2024-01-15T10:30:00Z",
  "data": {
    "id": "pay_abc123",
    "amount": "100.00",
    "currency": "USD",
    "status": "completed",
    "network": "ethereum",
    "transaction_hash": "0x123...",
    "metadata": {
      "order_id": "12345"
    }
  }
}
```

## Verifying Webhook Signatures

Always verify webhook signatures to ensure requests are from BITXpay:

::: code-group

```javascript [Node.js]
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// Express.js example
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-bitxpay-signature'];
  const payload = req.body.toString();
  
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const event = JSON.parse(payload);
  // Process the event
  
  res.status(200).send('OK');
});
```

```python [Python]
import hmac
import hashlib

def verify_webhook_signature(payload: bytes, signature: str, secret: str) -> bool:
    expected_signature = hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(signature, expected_signature)

# Flask example
@app.route('/webhook', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Bitxpay-Signature')
    payload = request.get_data()
    
    if not verify_webhook_signature(payload, signature, os.environ['WEBHOOK_SECRET']):
        return 'Invalid signature', 401
    
    event = request.json
    # Process the event
    
    return 'OK', 200
```

```php [PHP]
<?php

function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = hash_hmac('sha256', $payload, $secret);
    return hash_equals($signature, $expectedSignature);
}

// Example usage
$signature = $_SERVER['HTTP_X_BITXPAY_SIGNATURE'];
$payload = file_get_contents('php://input');
$secret = getenv('WEBHOOK_SECRET');

if (!verifyWebhookSignature($payload, $signature, $secret)) {
    http_response_code(401);
    exit('Invalid signature');
}

$event = json_decode($payload, true);
// Process the event

http_response_code(200);
echo 'OK';
```

:::

## Handling Webhook Events

Implement idempotent event handling to prevent duplicate processing:

```javascript
const processedEvents = new Set();

app.post('/webhook', async (req, res) => {
  const event = req.body;
  
  // Check if already processed
  if (processedEvents.has(event.id)) {
    return res.status(200).send('Already processed');
  }
  
  try {
    // Process based on event type
    switch (event.type) {
      case 'payment.completed':
        await handlePaymentCompleted(event.data);
        break;
      case 'payment.failed':
        await handlePaymentFailed(event.data);
        break;
      case 'transfer.completed':
        await handleTransferCompleted(event.data);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    // Mark as processed
    processedEvents.add(event.id);
    
    res.status(200).send('OK');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Processing error');
  }
});
```

## Best Practices

### 1. Respond quickly
Return a 200 status code as quickly as possible. Process events asynchronously if needed.

```javascript
app.post('/webhook', async (req, res) => {
  // Immediately acknowledge receipt
  res.status(200).send('OK');
  
  // Process asynchronously
  processWebhookAsync(req.body).catch(console.error);
});
```

### 2. Handle retries
BITXpay will retry failed webhooks with exponential backoff. Implement idempotency to handle duplicate events.

### 3. Use HTTPS
Webhook URLs must use HTTPS in production. HTTP is only allowed for local development.

### 4. Validate event types
Always check the event type before processing to handle new event types gracefully.

### 5. Store webhook secrets securely
Never hardcode webhook secrets. Use environment variables or secure secret management.

## Retry Policy

BITXpay automatically retries failed webhook deliveries:

- **Retry schedule**: 1min, 5min, 15min, 1hr, 6hr, 24hr
- **Success criteria**: HTTP 200-299 response
- **Timeout**: 30 seconds per attempt
- **Max retries**: 6 attempts over 24 hours

## Testing Webhooks Locally

### Using ngrok

```bash
# Install ngrok
npm install -g ngrok

# Start your local server
node server.js

# Expose it via ngrok
ngrok http 3000
```

Use the ngrok URL (e.g., `https://abc123.ngrok.io/webhook`) as your webhook URL in the BITXpay dashboard.

### Using webhook.site

1. Go to [webhook.site](https://webhook.site)
2. Copy your unique URL
3. Use it as your webhook URL for testing
4. View incoming webhooks in real-time

## Monitoring Webhooks

Monitor webhook delivery in your BITXpay dashboard:

1. Navigate to **Developers** → **Webhooks**
2. View delivery history, status codes, and response times
3. Manually retry failed deliveries
4. View webhook payload and response details

## Webhook Endpoints Management

### Create a webhook endpoint

```bash
curl -X POST https://api.bitxpay.com/v1/webhook-endpoints \
  -H "X-API-Key: your-api-key" \
  -H "X-Signature: your-signature" \
  -H "X-Timestamp: $(date +%s)000" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://yoursite.com/webhook",
    "events": ["payment.completed", "payment.failed"],
    "description": "Production webhook endpoint"
  }'
```

### List webhook endpoints

```bash
curl -X GET https://api.bitxpay.com/v1/webhook-endpoints \
  -H "X-API-Key: your-api-key" \
  -H "X-Signature: your-signature" \
  -H "X-Timestamp: $(date +%s)000"
```

### Delete a webhook endpoint

```bash
curl -X DELETE https://api.bitxpay.com/v1/webhook-endpoints/{endpoint_id} \
  -H "X-API-Key: your-api-key" \
  -H "X-Signature: your-signature" \
  -H "X-Timestamp: $(date +%s)000"
```

## Troubleshooting

### Webhooks not being received

1. **Check your endpoint is publicly accessible**: Test with `curl https://yoursite.com/webhook`
2. **Verify HTTPS**: Production webhooks require HTTPS
3. **Check firewall rules**: Ensure your server accepts requests from BITXpay IPs
4. **Review response codes**: Must return 200-299 for success

### Signature verification failing

1. **Use raw request body**: Don't parse JSON before verification
2. **Check secret**: Ensure you're using the correct webhook secret
3. **Verify header name**: Look for `X-Bitxpay-Signature` (case-insensitive)

### Duplicate events

Implement idempotency using the event `id` field to prevent duplicate processing.

## Support

For webhook-related issues:

- **Documentation**: [docs.bitxpay.com](https://docs.bitxpay.com)
- **Discord**: [discord.gg/bitxpay](https://discord.gg/bitxpay)
- **Email**: support@bitxpay.com
