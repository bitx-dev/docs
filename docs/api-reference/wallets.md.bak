---
title: Wallets API
description: Manage cryptocurrency wallets with the BitXPay Wallets API.
---

# Wallets API

The Wallets API allows you to manage your cryptocurrency wallets and view transactions.

## List Wallets

Retrieve all wallets associated with your account.

```http
GET /wallets
```

### Example Request

```bash
curl https://api.bitxpay.com/v1/wallets \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Signature: SIGNATURE" \
  -H "X-Timestamp: TIMESTAMP"
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "wal_btc123",
      "crypto": "BTC",
      "name": "Bitcoin Wallet",
      "address": "bc1q...",
      "balance": 0.5432,
      "pendingBalance": 0.0025,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "wal_eth456",
      "crypto": "ETH",
      "name": "Ethereum Wallet",
      "address": "0x...",
      "balance": 2.5,
      "pendingBalance": 0,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

## Get Wallet

Retrieve a specific wallet by ID.

```http
GET /wallets/:id
```

### Example Request

```bash
curl https://api.bitxpay.com/v1/wallets/wal_btc123 \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Signature: SIGNATURE" \
  -H "X-Timestamp: TIMESTAMP"
```

### Response

```json
{
  "success": true,
  "data": {
    "id": "wal_btc123",
    "crypto": "BTC",
    "name": "Bitcoin Wallet",
    "address": "bc1q...",
    "balance": 0.5432,
    "pendingBalance": 0.0025,
    "totalReceived": 10.5,
    "totalSent": 10.0,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Get Wallet Balance

Get the current balance of a wallet.

```http
GET /wallets/:id/balance
```

### Response

```json
{
  "success": true,
  "data": {
    "crypto": "BTC",
    "balance": 0.5432,
    "pendingBalance": 0.0025,
    "availableBalance": 0.5407,
    "balanceUsd": 23456.78
  }
}
```

## List Wallet Transactions

Retrieve transactions for a specific wallet.

```http
GET /wallets/:id/transactions
```

### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Filter by type (incoming, outgoing) |
| `status` | string | Filter by status |
| `limit` | number | Number of results (default: 20) |
| `offset` | number | Pagination offset |
| `from` | string | Start date (ISO 8601) |
| `to` | string | End date (ISO 8601) |

### Example Request

```bash
curl "https://api.bitxpay.com/v1/wallets/wal_btc123/transactions?limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "X-Signature: SIGNATURE" \
  -H "X-Timestamp: TIMESTAMP"
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "tx_abc123",
      "type": "incoming",
      "status": "confirmed",
      "amount": 0.0025,
      "crypto": "BTC",
      "txHash": "abc123...",
      "confirmations": 6,
      "paymentId": "pay_xyz789",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "meta": {
    "total": 156,
    "limit": 10,
    "offset": 0
  }
}
```

## Supported Cryptocurrencies

| Crypto | Name | Network |
|--------|------|---------|
| `BTC` | Bitcoin | Bitcoin Mainnet |
| `ETH` | Ethereum | Ethereum Mainnet |
| `USDT` | Tether | ERC-20 / TRC-20 |
| `USDC` | USD Coin | ERC-20 |
| `LTC` | Litecoin | Litecoin Mainnet |
