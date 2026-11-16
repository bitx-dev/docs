import crypto from 'node:crypto';
import express from 'express';

const app = express();
const secret = process.env.WEBHOOK_SECRET;
if (!secret) throw new Error('WEBHOOK_SECRET is required');

export function verifyWebhook(rawBody, signature, webhookSecret) {
  if (typeof signature !== 'string' || !/^sha256=[a-f0-9]{64}$/.test(signature)) {
    return false;
  }
  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest();
  return crypto.timingSafeEqual(Buffer.from(signature.slice(7), 'hex'), expected);
}

// Register before express.json() middleware to preserve the signed bytes.
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!verifyWebhook(req.body, req.headers['x-webhook-signature'], secret)) {
    return res.status(401).send('Invalid signature');
  }
  const event = JSON.parse(req.body.toString('utf8'));
  console.log('Webhook:', event.event_type, event.data);
  // Durably enqueue the verified event before acknowledging it.
  // Apply business changes idempotently using payment/transaction references
  // in event.data: delivery id changes on retry; event_id identifies a type.
  res.sendStatus(200);
});

app.listen(3000);
