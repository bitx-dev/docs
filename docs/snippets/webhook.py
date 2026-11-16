import hashlib
import hmac
import json
import os

from flask import Flask, request

app = Flask(__name__)
secret = os.environ['WEBHOOK_SECRET']


def verify_webhook(raw_body: bytes, signature: str, webhook_secret: str) -> bool:
    expected = 'sha256=' + hmac.new(
        webhook_secret.encode('utf-8'), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature.encode('utf-8'), expected.encode('ascii'))


@app.post('/webhook')
def webhook():
    raw_body = request.get_data()
    signature = request.headers.get('X-Webhook-Signature', '')
    if not verify_webhook(raw_body, signature, secret):
        return 'Invalid signature', 401
    event = json.loads(raw_body)
    app.logger.info('Webhook: %s', event['event_type'])
    # Durably enqueue before acknowledging. Deduplicate business changes using
    # payment/transaction references in event['data'], not the delivery id.
    return 'OK', 200


if __name__ == '__main__':
    app.run(port=3000)
