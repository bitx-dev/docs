# Supported Networks

BITXpay integrates EVM and non-EVM networks. Availability is environment-specific and depends on the operation. Discover active networks and currencies at runtime instead of treating a fixed count or token list as the payment contract.

## Network discovery API

These routes are public, relative to `/api/v1`, and do not require merchant signatures:

| Method | Path | Query parameters | Response data |
|--------|------|------------------|---------------|
| `GET` | `/networks/active` | None | Active network records in `data` |
| `GET` | `/get-networks` | `active_only` (default true), `include_testnets` (default false), `chain_id` | `data.networks`, with supported currencies per network |
| `GET` | `/get-network-currencies` | `active_only` (default true), `compact` (default false) | Combined network, fiat, and crypto metadata in `data` |

General network metadata is broader than checkout capability. For an engine-backed payment, use the [checkout catalog](/api-reference/payments#_7-get-checkout-catalog) and then the [specific link's options](/api-reference/checkout#get-payment-options).

## What is a network?

A network refers to the underlying blockchain infrastructure that powers transactions, decentralized applications (dApps), and smart contracts. Each network operates with its own set of rules, consensus mechanism, and native token. All wallets, addresses, and digital assets are created and exist specifically on one network.

## EVM networks

Ethereum Virtual Machine-compatible chains share the same address format, tooling, and smart contract language (Solidity). An address on one EVM chain looks identical to an address on another, but they are entirely separate. **Never send funds to an address on the wrong EVM chain.**

## Non-EVM networks

Bitcoin, Solana, and Tron use their own address formats and transaction models. Addresses are visually distinct and not compatible with EVM wallets. Each requires dedicated integration handling.

## Network overview

The following table gives examples of network families and assets. Query the endpoints above for the current deployment catalog.

| # | Network | Type | Status | Native token | Common assets |
|---|---------|------|--------|--------------|---------------|
| 01 | Bitcoin | Non-EVM | Mainnet | BTC | BTC |
| 02 | Ethereum | EVM | Mainnet | ETH | ETH, USDT, USDC, DAI |
| 03 | BNB | EVM | Mainnet | BNB | BNB, USDT, BUSD, USDC |
| 04 | Solana | Non-EVM | Mainnet | SOL | SOL, USDC, USDT |
| 05 | Tron | Non-EVM | Mainnet | TRX | TRX, USDT (TRC-20) |
| 06 | Polygon | EVM | Mainnet | POL | POL, USDT, USDC, DAI |
| 07 | Avalanche | EVM | Mainnet | AVAX | AVAX, USDT, USDC |
| 08 | Arbitrum | EVM | Mainnet | ETH | ETH, USDT, USDC, ARB |
| 09 | Optimism | EVM | Mainnet | ETH | ETH, USDT, USDC, OP |
| 10 | Base | EVM | Mainnet | ETH | ETH, USDC, DAI |
| 11 | Linea | EVM | Mainnet | ETH | ETH, USDC |
| 12 | Gnosis | EVM | Mainnet | xDAI | xDAI, USDC, GNO |
| 13 | Sonic | EVM | Mainnet | S | S, USDC |
| 14 | Soneium | EVM | Mainnet | ETH | ETH, USDC |
| 15 | Unichain | EVM | Mainnet | ETH | ETH, USDC, UNI |
| 16 | Ink | EVM | Mainnet | ETH | ETH, USDC |

::: tip Discover payment availability
Use [Get Currencies](/api-reference/payments#_1-get-currencies) for denomination codes and the [checkout catalog](/api-reference/payments#_7-get-checkout-catalog) for currently offerable chains/tokens. Availability depends on deployment and the payment route; the overview table is not a checkout availability guarantee. Use [public checkout options](/api-reference/checkout#get-payment-options) for a specific link.
:::

## Mainnets

### Production-only environment

Use mainnets when building production-grade applications and handling real-world transactions through BITXpay APIs. This includes:

- **Sending actual cryptocurrency** (such as withdrawals and payments)
- **Interacting with live DeFi protocols** (for example, staking, lending, or yield farming)
- **Reading real-time on-chain data** for dashboards, analytics, and reporting

BITXpay APIs make production workflows significantly easier by allowing you to query account balances, transaction history, and blockchain events all without the need to run or maintain your own node.

### Real payments
Sending actual cryptocurrency — withdrawals, payouts, invoice settlements

### On-chain data
Reading live balances, transaction history, and blockchain events

### DeFi interactions
Staking, lending, yield farming, or any live protocol interaction

::: warning Important Note
Do not assume that selecting the sandbox host makes a payment simulated. For engine checkout, explicitly create a link with `is_test: true` and check its returned state.
:::
