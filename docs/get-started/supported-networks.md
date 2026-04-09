# Supported Networks

BitXPay supports 16 blockchain networks across both EVM and non-EVM ecosystems. All networks run on mainnet only. Choose the network that fits your assets, your users, and your fee requirements. This page provides an overview of the blockchain networks we currently support.

**Total Networks**: 16  
**EVM networks**: 13  
**Non-EVM Networks**: 3

## What is a network?

A network refers to the underlying blockchain infrastructure that powers transactions, decentralized applications (dApps), and smart contracts. Each network operates with its own set of rules, consensus mechanism, and native token. All wallets, addresses, and digital assets are created and exist specifically on one network.

## EVM networks

Ethereum Virtual Machine-compatible chains share the same address format, tooling, and smart contract language (Solidity). An address on one EVM chain looks identical to an address on another, but they are entirely separate. **Never send funds to an address on the wrong EVM chain.**

## Non-EVM networks

Bitcoin, Solana, and Tron use their own address formats and transaction models. Addresses are visually distinct and not compatible with EVM wallets. Each requires dedicated integration handling.

## Network List

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

## Mainnets

### Production-only environment

Use mainnets when building production-grade applications and handling real-world transactions through BitXPay APIs. This includes:

- **Sending actual cryptocurrency** (such as withdrawals and payments)
- **Interacting with live DeFi protocols** (for example, staking, lending, or yield farming)
- **Reading real-time on-chain data** for dashboards, analytics, and reporting

BitXPay APIs make production workflows significantly easier by allowing you to query account balances, transaction history, and blockchain events all without the need to run or maintain your own node.

### Real payments
Sending actual cryptocurrency — withdrawals, payouts, invoice settlements

### On-chain data
Reading live balances, transaction history, and blockchain events

### DeFi interactions
Staking, lending, yield farming, or any live protocol interaction

::: warning Important Note
BitXPay currently operates exclusively on mainnets. We do not support testnets at this time.
:::
