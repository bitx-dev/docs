---
title: Environments
description: Understand BitXPay sandbox and production environments.
---

# Environments

BitXPay provides two environments: **Sandbox** for testing and **Production** for live payments.

## Sandbox Environment

Use the sandbox environment to test your integration without processing real transactions.

### Sandbox Configuration

```javascript
const bitxpay = new BitXPay({
  apiKey: process.env.BITXPAY_SANDBOX_API_KEY,
  secretKey: process.env.BITXPAY_SANDBOX_SECRET_KEY,
  environment: 'sandbox'
});
```

### Sandbox API Base URL
```
https://sandbox-api.bitxpay.com/v1
```

### Test Credentials

| Credential | Value |
|------------|-------|
| Test Card | Use any valid format |
| Test Wallet | Testnet addresses only |
| API Keys | Prefixed with `sk_test_` |

### Simulating Scenarios

In sandbox mode, use these magic amounts to simulate different outcomes:

| Amount | Scenario |
|--------|----------|
| `$1.00` | Payment succeeds |
| `$2.00` | Payment pending (delayed confirmation) |
| `$3.00` | Payment fails |
| `$4.00` | Payment expires |

## Production Environment

Use the production environment for real transactions.

### Production Configuration

```javascript
const bitxpay = new BitXPay({
  apiKey: process.env.BITXPAY_API_KEY,
  secretKey: process.env.BITXPAY_SECRET_KEY,
  environment: 'production'
});
```

### Production API Base URL
```
https://api.bitxpay.com/v1
```

## Environment Differences

| Feature | Sandbox | Production |
|---------|---------|------------|
| Real transactions | No | Yes |
| API Keys | `sk_test_*` | `sk_live_*` |
| Webhooks | Test events | Real events |
| Rate limits | Lower | Higher |
| Blockchain | Testnets | Mainnets |

## Going Live Checklist

Before switching to production:

- [ ] All tests pass in sandbox
- [ ] Webhook endpoints are secure (HTTPS)
- [ ] Webhook signature verification is implemented
- [ ] Error handling is robust
- [ ] Logging is configured
- [ ] Production API keys are securely stored
- [ ] Rate limiting is handled

::: tip
We recommend keeping your sandbox integration active for ongoing testing and development.
:::
