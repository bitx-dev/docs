---
editLink:
  pattern: https://www.npmjs.com/package/@bitxpay/wallet-sdk
  text: View on npm
---

# Wallet SDK

The `@bitxpay/wallet-sdk` package enables client-side wallet connection and transaction signing for browser and React Native applications. Use it to build dApps, checkout flows, and wallet-connected experiences on top of BITXpay.

**npm:** [npmjs.com/package/@bitxpay/wallet-sdk](https://www.npmjs.com/package/@bitxpay/wallet-sdk)

## Installation

::: code-group

```bash [npm]
npm install @bitxpay/wallet-sdk
```

```bash [yarn]
yarn add @bitxpay/wallet-sdk
```

```bash [pnpm]
pnpm add @bitxpay/wallet-sdk
```

:::

## Requirements

- **Browser** any modern browser with ES2020 support
- **React Native** 0.70+
- **React** 17+ (for React hooks)

---

## Quick Start

```typescript
import { WalletClient } from '@bitxpay/wallet-sdk';

const wallet = new WalletClient({
  projectId: 'your_project_id',
  environment: 'sandbox' // 'sandbox' | 'production'
});

// Connect a wallet
const account = await wallet.connect();
console.log('Connected address:', account.address);
```

---

## Configuration

### `new WalletClient(options)`

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `projectId` | `string` | ✅ | — | Your BITXpay project ID |
| `environment` | `'sandbox' \| 'production'` | ❌ | `'sandbox'` | Target environment |
| `chains` | `Chain[]` | ❌ | All supported | Chains to enable |
| `theme` | `'light' \| 'dark' \| 'auto'` | ❌ | `'auto'` | UI theme for modals |

---

## Wallet Connection

### Connect

Opens the wallet connection modal and returns the connected account.

```typescript
const account = await wallet.connect();

console.log('Address:', account.address);
console.log('Chain:', account.chainId);
```

### Disconnect

```typescript
await wallet.disconnect();
```

### Get current account

```typescript
const account = wallet.getAccount();

if (account) {
  console.log('Connected:', account.address);
} else {
  console.log('Not connected');
}
```

### Listen for account changes

```typescript
wallet.on('accountChanged', (account) => {
  console.log('Account changed:', account?.address);
});

wallet.on('chainChanged', (chainId) => {
  console.log('Chain changed:', chainId);
});

wallet.on('disconnected', () => {
  console.log('Wallet disconnected');
});
```

---

## Payments

### Pay with connected wallet

Use the wallet to directly sign and submit a BITXpay payment:

```typescript
const result = await wallet.pay({
  paymentId: 'pay_xxxxxxxxxxxxxxxx', // ID from @bitxpay/sdk
  onSuccess: (txHash) => {
    console.log('Transaction hash:', txHash);
  },
  onError: (err) => {
    console.error('Payment failed:', err.message);
  }
});
```

### Open payment link

Open a BITXpay hosted payment link with the connected wallet pre-filled:

```typescript
await wallet.openPaymentLink('https://pay.bitxpay.com/pl_xxxxxx');
```

---

## Transaction Signing

### Sign a message

```typescript
const signature = await wallet.signMessage('Hello from BITXpay');
console.log('Signature:', signature);
```

### Sign typed data (EIP-712)

```typescript
const signature = await wallet.signTypedData({
  domain: { name: 'BITXpay', version: '1', chainId: 1 },
  types: {
    Payment: [
      { name: 'amount', type: 'uint256' },
      { name: 'recipient', type: 'address' }
    ]
  },
  message: {
    amount: '1000000',
    recipient: '0xRecipientAddress'
  }
});
```

### Send a transaction

```typescript
const txHash = await wallet.sendTransaction({
  to: '0xRecipientAddress',
  value: '0.01', // in ETH / native token
  data: '0x' // optional calldata
});

console.log('Transaction hash:', txHash);
```

---

## React Integration

The SDK ships with React hooks for seamless integration.

### `WalletProvider`

Wrap your app with `WalletProvider`:

```tsx
import { WalletProvider } from '@bitxpay/wallet-sdk/react';

function App() {
  return (
    <WalletProvider
      projectId="your_project_id"
      environment="sandbox"
    >
      <YourApp />
    </WalletProvider>
  );
}
```

### `useWallet`

Access wallet state and actions anywhere in your component tree:

```tsx
import { useWallet } from '@bitxpay/wallet-sdk/react';

function ConnectButton() {
  const { account, connect, disconnect, isConnecting } = useWallet();

  if (account) {
    return (
      <div>
        <p>Connected: {account.address}</p>
        <button onClick={disconnect}>Disconnect</button>
      </div>
    );
  }

  return (
    <button onClick={connect} disabled={isConnecting}>
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

### `usePayment`

Pay a BITXpay invoice from a React component:

```tsx
import { usePayment } from '@bitxpay/wallet-sdk/react';

function PayButton({ paymentId }: { paymentId: string }) {
  const { pay, isPaying, error } = usePayment(paymentId);

  return (
    <div>
      <button onClick={pay} disabled={isPaying}>
        {isPaying ? 'Processing...' : 'Pay Now'}
      </button>
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

### `useBalance`

Fetch the connected wallet's token balances:

```tsx
import { useBalance } from '@bitxpay/wallet-sdk/react';

function BalanceDisplay() {
  const { balances, isLoading } = useBalance();

  if (isLoading) return <p>Loading...</p>;

  return (
    <ul>
      {balances.map(b => (
        <li key={b.token}>{b.amount} {b.token}</li>
      ))}
    </ul>
  );
}
```

---

## Supported Wallets

| Wallet | Browser Extension | Mobile |
|--------|------------------|--------|
| MetaMask | ✅ | ✅ |
| WalletConnect | ✅ | ✅ |
| Coinbase Wallet | ✅ | ✅ |
| Trust Wallet | ❌ | ✅ |
| Rainbow | ❌ | ✅ |

---

## Supported Chains

| Chain | Chain ID | Testnet Available |
|-------|----------|-------------------|
| Ethereum | 1 | ✅ (Sepolia) |
| BNB Smart Chain | 56 | ✅ (Testnet) |
| Polygon | 137 | ✅ (Amoy) |
| Arbitrum One | 42161 | ✅ |
| Base | 8453 | ✅ |
| Optimism | 10 | ✅ |

---

## Error Handling

```typescript
import { WalletError, WalletRejectedError } from '@bitxpay/wallet-sdk';

try {
  await wallet.pay({ paymentId: 'pay_xxx' });
} catch (err) {
  if (err instanceof WalletRejectedError) {
    console.log('User rejected the transaction');
  } else if (err instanceof WalletError) {
    console.error('Wallet error:', err.code, err.message);
  } else {
    throw err;
  }
}
```

### Common error codes

| Code | Description |
|------|-------------|
| `WALLET_NOT_CONNECTED` | No wallet is connected |
| `USER_REJECTED` | User cancelled the action |
| `CHAIN_NOT_SUPPORTED` | Connected chain is not supported |
| `INSUFFICIENT_BALANCE` | Not enough funds to complete payment |
| `TRANSACTION_FAILED` | On-chain transaction reverted |

---

## Next Steps

- [JavaScript SDK](/sdks/javascript-sdk) Server-side SDK for payment creation
- [API Reference](/api-reference/) Full REST API documentation
- [Supported Networks](/get-started/supported-networks) All supported blockchains
- [Testing](/testing/) Test your wallet integration in sandbox
