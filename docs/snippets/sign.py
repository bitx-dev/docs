import base64
import json
import os
from datetime import datetime, timezone

import requests
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ed25519, padding


def load_private_key(raw: str):
    """Load the key exactly as the dashboard issued it.

    "Ed25519:<base64 PKCS#8 DER>"   current keys
    "-----BEGIN PRIVATE KEY-----"   legacy RSA keys (PEM)
    """
    raw = raw.strip()
    if raw.startswith("Ed25519:"):
        der = base64.b64decode(raw[len("Ed25519:"):])
        return serialization.load_der_private_key(der, password=None)
    return serialization.load_pem_private_key(raw.encode(), password=None)


def sign(private_key, method: str, path: str, timestamp: str, body: str = "") -> str:
    # message = METHOD + PATH + TIMESTAMP + BODY (no separators)
    # PATH is the full request path, including the /api/v1 prefix.
    message = f"{method}{path}{timestamp}{body}".encode("utf-8")
    if isinstance(private_key, ed25519.Ed25519PrivateKey):
        signature = private_key.sign(message)  # Ed25519 hashes internally; do not pre-hash
    else:  # legacy RSA keys: RSA-PSS + SHA-256
        signature = private_key.sign(
            message,
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.DIGEST_LENGTH),
            hashes.SHA256(),
        )
    return base64.b64encode(signature).decode("ascii")


# Usage
api_key = os.environ["MERCHANT_API_KEY"]                       # btxm_xxxxxxxxxxxx
private_key = load_private_key(os.environ["MERCHANT_PRIVATE_KEY"])  # Ed25519:MC4CAQAw...

host = "https://sandboxapi.bitxpay.com"
path = "/api/v1/payment_links"                                  # sign the FULL path
method = "POST"
timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")  # RFC 3339, UTC
body = json.dumps({
    "payment_name": "Invoice #12345",
    "amount": 100.5,
    "currency": "USDT",
    "customer_email": "john@example.com",
    "success_url": "https://example.com/success",
    "cancel_url": "https://example.com/cancel",
})

signature = sign(private_key, method, path, timestamp, body)

response = requests.post(
    host + path,
    headers={
        "X-API-Key": api_key,
        "X-API-Signature": signature,
        "X-API-Timestamp": timestamp,
        "Content-Type": "application/json",
    },
    data=body,  # send the exact string that was signed (not json=...)
)
print(response.status_code, response.json())
