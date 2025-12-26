# API Examples - Vault Signer

Complete API reference for the Vault Signer multi-network EIP-7702 gasless transfer system.

---

## Authentication

Most API endpoints require authentication via API key. Include the `X-API-Key` header in your requests:

```bash
curl -H "X-API-Key: your-api-key-here" http://localhost:3000/endpoint
```

Configure your API key in `.env`:
```bash
API_KEY=your-secure-api-key-here
```

**Endpoints requiring authentication:**
- `POST /keys/generate`
- `POST /signing/sign-data`
- `POST /contracts/deploy`
- `GET /contracts/deployer/balance`
- `GET /contracts/caller/balance/:address`
- `GET /contracts/callers`
- `GET /contracts/callers/latest`
- `GET /contracts/callers/by-network`
- `GET /contracts/callers/:address`
- `POST /eip7702/transfer`

**Public endpoints (no auth required):**
- `GET /contracts/networks`
- `GET /eip7702/info`
- `POST /signing/sign-authorization`

---

## Table of Contents

1. [Contract Deployment](#contract-deployment)
   - [POST /contracts/deploy](#post-contractsdeploy)
   - [GET /contracts/deployer/balance](#get-contractsdeployerbalance)
   - [GET /contracts/caller/balance/:address](#get-contractscallerbalanceaddress)
   - [GET /contracts/callers](#get-contractscallers)
   - [GET /contracts/callers/latest](#get-contractscallerslatest)
   - [GET /contracts/callers/by-network](#get-contractscallersby-network)
   - [GET /contracts/callers/:address](#get-contractscallersaddress)
   - [GET /contracts/networks](#get-contractsnetworks)
2. [EIP-7702 Gasless Transfers](#eip-7702-gasless-transfers)
   - [POST /eip7702/transfer](#post-eip7702transfer)
   - [GET /eip7702/info](#get-eip7702info)
3. [Key Management](#key-management)
   - [POST /keys/generate](#post-keysgenerate)
4. [Signing](#signing)
   - [POST /signing/sign-data](#post-signingsign-data)
   - [POST /signing/sign-authorization](#post-signingsign-authorization)

---

## Contract Deployment

### POST /contracts/deploy

Deploys SimpleDelegate contract to enabled networks using **CREATE2 factory** for deterministic addresses.

**Key Features:**
- ✅ Same contract address on all networks
- ✅ Generates new authorized caller automatically OR uses existing one
- ✅ Optional request body for custom deployment
- ✅ Parallel deployment to multiple networks
- ✅ Deploy to specific networks or all enabled networks

#### Request (No Body - Generate New Caller)

```bash
curl -X POST http://localhost:3000/contracts/deploy \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

**No request body needed!** The deployer private key is read from `DEPLOYER_PRIVATE_KEY` in `.env`.

#### Request (With Existing Authorized Caller)

```bash
curl -X POST http://localhost:3000/contracts/deploy \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "authorized_caller": "0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7"
  }'
```

If the provided `authorized_caller` address is different from the current one in the contract, it will:
1. Update the contract with the new address
2. Recompile the contract
3. Deploy to all enabled networks

#### Request (Deploy to Specific Networks)

```bash
curl -X POST http://localhost:3000/contracts/deploy \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "networks": ["ethereum", "arbitrum", "base"]
  }'
```

You can also combine both options:

```bash
curl -X POST http://localhost:3000/contracts/deploy \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "authorized_caller": "0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7",
    "networks": ["ethereum", "base"]
  }'
```

**Request Body Parameters (all optional):**
- `authorized_caller` (string): Ethereum address to use as authorized caller. If different from current, updates contract and redeploys.
- `networks` (array): Array of network names (case-insensitive) or chain IDs to deploy to. Defaults to all enabled networks.

#### Response

```json
{
  "success": true,
  "data": {
    "authorized_caller": {
      "address": "0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7",
      "account_seal": "NCjoCqPj8yjeGbtJ8RJgBMLq1XMZhknivj0iYGN4ymCY45e2mQYxPF+cZOn5Jkjbix5xnXdqQg3JCF2AlJ5qhA==",
      "is_new": true,
      "updated_contract": true
    },
    "deployer": {
      "address": "0x75a85D0fA257005d4b19f844609cD8f1c2F83f00"
    },
    "deployments": {
      "successful": [
        {
          "network": "Ethereum",
          "chainId": 1,
          "contractAddress": "0x68Cf52B67213a920767CFa0648f20FEF06Bd9B04",
          "transactionHash": "0x13e2bd87585f5a023676bcccfabc630f37442bf6401ed6cfbddc565c8eeeb407",
          "success": true
        },
        {
          "network": "Arbitrum One",
          "chainId": 42161,
          "contractAddress": "0x68Cf52B67213a920767CFa0648f20FEF06Bd9B04",
          "transactionHash": "0xab7a06a7f5900b9edfb9e89ae164f02dbc31a3fb9391fa573865acd27dbc55d8",
          "success": true
        }
      ],
      "failed": [],
      "total": 2
    }
  }
}
```

**Response Fields:**
- `authorized_caller.address`: The authorized caller address used for deployment
- `authorized_caller.account_seal`: Encrypted private key (only present if new caller was generated)
- `authorized_caller.is_new`: Whether this is a different authorized caller than the current one in contract
- `authorized_caller.updated_contract`: Whether the contract was updated with new authorized caller
- `deployments.successful`: Array of successful deployments with transaction hashes
- `deployments.failed`: Array of failed deployments with error messages
- `deployments.total`: Total number of networks attempted

#### What It Does

1. **Reads deployer** from `DEPLOYER_PRIVATE_KEY` environment variable
2. **Checks authorized caller**:
   - If `authorized_caller` provided in request body, uses that address
   - If not provided, generates new authorized caller wallet using viem
3. **Updates contract if needed**:
   - If authorized caller differs from current one in contract, updates `SimpleDelegate.sol`
   - Encrypts new caller's private key with AES-256-GCM (if generated)
4. **Compiles contract** using Hardhat
5. **Deploys to networks**:
   - If `networks` array provided, deploys only to those networks
   - Otherwise, deploys to all enabled networks
6. **Deploys via CREATE2 factory** (`0x4e59b44847b379578588920ca78fbf26c0b4956c`)
7. **Returns identical address** on all networks!

#### CREATE2 Deterministic Deployment

The contract is deployed to the **SAME address on all networks**:
- Formula: `keccak256(0xff ++ factory ++ salt ++ keccak256(bytecode))[12:]`
- Factory: `0x4e59b44847b379578588920ca78fbf26c0b4956c` (Arachnid Deterministic Deployment Proxy)
- Same salt + Same bytecode = Same address everywhere!

#### Environment Setup

```bash
# .env
DEPLOYER_PRIVATE_KEY=0x50be52da736d8dd2c9130c7a78057b58de2e1781203f6743cf99dc791ca1bc81
ALCHEMY_API_KEY_ETHEREUM=your-ethereum-key
ALCHEMY_API_KEY_ARBITRUM=your-arbitrum-key
ALCHEMY_API_KEY_POLYGON=your-polygon-key
ALCHEMY_API_KEY_OPTIMISM=your-optimism-key
ALCHEMY_API_KEY_BASE=your-base-key
```

#### Important Notes

- **Deployer must have ETH** on all enabled networks
- **Save `authorized_caller.account_seal`** - you'll need it for gasless transfers
- **Contract address is identical** on all networks (CREATE2 magic!)

---

### GET /contracts/deployer/balance

Check ETH balance of deployer address on all enabled networks.

#### Request

```bash
curl http://localhost:3000/contracts/deployer/balance \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": "0x75a85D0fA257005d4b19f844609cD8f1c2F83f00",
    "balances": [
      {
        "network": "Ethereum",
        "chainId": 1,
        "balance": "7604916809301310",
        "balanceFormatted": "0.00760491680930131",
        "success": true
      },
      {
        "network": "Arbitrum One",
        "chainId": 42161,
        "balance": "46977689438293351",
        "balanceFormatted": "0.046977689438293351",
        "success": true
      }
    ]
  }
}
```

---

### GET /contracts/caller/balance/:address

Check ETH balance of an authorized caller address on all enabled networks.

#### Request

```bash
curl http://localhost:3000/contracts/caller/balance/0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7 \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

**Path Parameter:**
- `address`: Ethereum address of the authorized caller (must be valid 0x-prefixed address)

#### Response

```json
{
  "success": true,
  "data": {
    "address": "0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7",
    "balances": [
      {
        "network": "Ethereum",
        "chainId": 1,
        "balance": "0",
        "balanceFormatted": "0",
        "success": true
      },
      {
        "network": "Arbitrum One",
        "chainId": 42161,
        "balance": "5000000000000000",
        "balanceFormatted": "0.005",
        "success": true
      },
      {
        "network": "OP Mainnet",
        "chainId": 10,
        "balance": "0",
        "balanceFormatted": "0",
        "success": true
      }
    ]
  }
}
```

**Use Case:**
- Check if authorized caller needs funding on specific networks
- Monitor authorized caller balance across all networks
- Verify authorized caller has enough ETH for gas on networks where they pay gas

---

### GET /contracts/callers

Get all authorized callers that have been created and deployed.

#### Request

```bash
curl http://localhost:3000/contracts/callers \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

#### Response

```json
{
  "success": true,
  "data": {
    "callers": [
      {
        "address": "0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7",
        "account_seal": "NCjoCqPj8yjeGbtJ8RJgBMLq1XMZhknivj0iYGN4ymCY45e2mQYxPF+cZOn5Jkjbix5xnXdqQg3JCF2AlJ5qhA==",
        "networks": ["Ethereum", "Arbitrum One", "OP Mainnet", "Base", "BNB Smart Chain"],
        "chainIds": [1, 42161, 10, 8453, 56],
        "contractAddress": "0x68Cf52B67213a920767CFa0648f20FEF06Bd9B04",
        "createdAt": "2025-12-25T10:00:00.000Z",
        "deploymentTxHashes": {
          "Ethereum": "0x13e2bd...",
          "Arbitrum One": "0xab7a06...",
          "OP Mainnet": "0x325a19...",
          "Base": "0x...",
          "BNB Smart Chain": "0xabd903..."
        }
      }
    ],
    "total": 1
  }
}
```

**Use Case:**
- View complete history of all authorized callers
- Audit which callers have been deployed
- Track deployment history across networks

---

### GET /contracts/callers/latest

Get the most recently created authorized caller.

#### Request

```bash
curl http://localhost:3000/contracts/callers/latest \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": "0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7",
    "account_seal": "NCjoCqPj8yjeGbtJ8RJgBMLq1XMZhknivj0iYGN4ymCY45e2mQYxPF+cZOn5Jkjbix5xnXdqQg3JCF2AlJ5qhA==",
    "networks": ["Ethereum", "Arbitrum One", "OP Mainnet", "Base", "BNB Smart Chain"],
    "chainIds": [1, 42161, 10, 8453, 56],
    "contractAddress": "0x68Cf52B67213a920767CFa0648f20FEF06Bd9B04",
    "createdAt": "2025-12-25T10:00:00.000Z",
    "deploymentTxHashes": {
      "Ethereum": "0x13e2bd...",
      "Arbitrum One": "0xab7a06..."
    }
  }
}
```

**Use Case:**
- Get the currently active authorized caller
- Retrieve account_seal for executing transfers
- Quick reference for latest deployment

---

### GET /contracts/callers/by-network

Get the latest authorized caller for each network.

#### Request

```bash
curl http://localhost:3000/contracts/callers/by-network \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

#### Response

```json
{
  "success": true,
  "data": {
    "Ethereum": {
      "address": "0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7",
      "networks": ["Ethereum", "Arbitrum One"],
      "chainIds": [1, 42161],
      "contractAddress": "0x68Cf52B67213a920767CFa0648f20FEF06Bd9B04",
      "createdAt": "2025-12-25T10:00:00.000Z"
    },
    "Arbitrum One": {
      "address": "0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7",
      "networks": ["Ethereum", "Arbitrum One"],
      "chainIds": [1, 42161],
      "contractAddress": "0x68Cf52B67213a920767CFa0648f20FEF06Bd9B04",
      "createdAt": "2025-12-25T10:00:00.000Z"
    }
  }
}
```

**Use Case:**
- **Primary endpoint for getting network-specific caller addresses**
- Check which authorized caller is active on each network
- Verify consistency across networks
- Useful for frontends that need per-network caller info

---

### GET /contracts/callers/:address

Get details for a specific authorized caller by address.

#### Request

```bash
curl http://localhost:3000/contracts/callers/0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7 \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": "0x57468bF1147F29D8B5c1D9f506D54e89bf13d7f7",
    "account_seal": "NCjoCqPj8yjeGbtJ8RJgBMLq1XMZhknivj0iYGN4ymCY45e2mQYxPF+cZOn5Jkjbix5xnXdqQg3JCF2AlJ5qhA==",
    "networks": ["Ethereum", "Arbitrum One", "OP Mainnet", "Base", "BNB Smart Chain"],
    "chainIds": [1, 42161, 10, 8453, 56],
    "contractAddress": "0x68Cf52B67213a920767CFa0648f20FEF06Bd9B04",
    "createdAt": "2025-12-25T10:00:00.000Z",
    "deploymentTxHashes": {
      "Ethereum": "0x13e2bd...",
      "Arbitrum One": "0xab7a06..."
    }
  }
}
```

**Use Case:**
- Look up a specific authorized caller
- Retrieve account_seal for a known address
- Check deployment details for an address

---

### GET /contracts/networks

List enabled networks and their configuration.

#### Request

```bash
curl http://localhost:3000/contracts/networks
```

#### Response

```json
{
  "success": true,
  "data": {
    "networks": [
      {
        "name": "Ethereum",
        "chainId": 1,
        "enabled": true,
        "hasApiKey": true
      },
      {
        "name": "Arbitrum One",
        "chainId": 42161,
        "enabled": true,
        "hasApiKey": true
      }
    ]
  }
}
```

To change enabled networks, edit `ENABLED_NETWORKS` in [src/services/networks.ts](src/services/networks.ts:6).

---

## EIP-7702 Gasless Transfers

### POST /eip7702/transfer

Execute gasless ERC20 transfers using EIP-7702 delegation. **Payment wallet doesn't need ETH!**

**How It Works:**
1. Payment wallet signs EIP-7702 authorization to delegate to SimpleDelegate
2. Authorized caller sends transaction (pays gas)
3. Payment wallet's tokens are transferred without needing ETH

#### Request

```bash
curl -X POST http://localhost:3000/eip7702/transfer \
  -H "Content-Type: application/json" \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -d '{
    "payment_wallet_seal": "HcGVADasIdsJX+pmIld4rGZzGlllQ6HrS4tOUfnlciM93YF85BdP6ZPj3IIJUkQWXAjxtZkl9fg1oeznuSzchg==",
    "authorized_caller_seal": "pF/OOFgreKAImlrVI7VhnPXhk2pLld21hTQMuAuXT3Yud0zlZnv/qpUk2ogavmN6T6VtEVp2NCyj5GPWeL294g==",
    "delegate_address": "0xf6861ef74976a5A4E13f94198A9FfE8Cf19c59bd",
    "token_address": "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    "recipient_address": "0x75a85D0fA257005d4b19f844609cD8f1c2F83f00",
    "amount": "3000000",
    "chain_id": 1
  }'
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `payment_wallet_seal` | string | Yes | Encrypted private key of wallet holding tokens (no ETH needed!) |
| `authorized_caller_seal` | string | Yes | Encrypted private key of caller paying gas |
| `delegate_address` | string | Yes | SimpleDelegate contract address |
| `token_address` | string | Yes | ERC20 token contract address |
| `recipient_address` | string | Yes | Where to send tokens |
| `amount` | string | Yes | Amount in wei (e.g., "3000000" = 3 USDC) |
| `chain_id` | number | No | Specific network (omit for all enabled networks) |

#### Response (Single Network)

```json
{
  "success": true,
  "data": {
    "success": true,
    "chainId": 1,
    "network": "Ethereum",
    "paymentWallet": "0x52a1F8Fa942f444a49ba4E631B396f71f87934Fe",
    "transactionHash": "0x9f6a6a8ca5bb3d08c33411c4500792715cbafe89a900d3e90d88fdeebd279a37"
  }
}
```

#### Response (Multiple Networks)

When `chain_id` is omitted, transfers execute on all enabled networks:

```json
{
  "success": true,
  "data": {
    "successful": [
      {
        "success": true,
        "chainId": 1,
        "network": "Ethereum",
        "paymentWallet": "0x52a1F8Fa942f444a49ba4E631B396f71f87934Fe",
        "transactionHash": "0x9f6a..."
      },
      {
        "success": true,
        "chainId": 42161,
        "network": "Arbitrum One",
        "paymentWallet": "0x52a1F8Fa942f444a49ba4E631B396f71f87934Fe",
        "transactionHash": "0x5133b..."
      }
    ],
    "failed": [],
    "total": 2
  }
}
```

#### Token Addresses

**USDC (6 decimals)**
- Ethereum: `0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48`
- Arbitrum: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`
- USDC.e (Arbitrum bridged): `0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8`
- Polygon: `0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359`
- Optimism: `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`
- Base: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

**USDT (6 decimals)**
- Ethereum: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- Arbitrum: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`
- Polygon: `0xc2132D05D31c914a87C6611C10748AEb04B58e8F`

**DAI (18 decimals)**
- Ethereum: `0x6B175474E89094C44Da98b954EedeAC495271d0F`
- Arbitrum: `0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1`
- Polygon: `0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063`

#### Amount Formatting

The `amount` must be in the token's smallest unit (wei):

| Token | Decimals | Human Amount | API Amount |
|-------|----------|--------------|------------|
| USDC | 6 | 1 USDC | `"1000000"` |
| USDC | 6 | 100 USDC | `"100000000"` |
| USDT | 6 | 50 USDT | `"50000000"` |
| DAI | 18 | 1 DAI | `"1000000000000000000"` |
| DAI | 18 | 10 DAI | `"10000000000000000000"` |

#### Example: Complete End-to-End Flow

```bash
# Set API key
API_KEY="vault-signer-secret-key-12345"

# Step 1: Generate payment wallet (will hold tokens, no ETH needed!)
PAYMENT_RESPONSE=$(curl -s -X POST http://localhost:3000/keys/generate \
  -H "X-API-Key: $API_KEY")
PAYMENT_SEAL=$(echo $PAYMENT_RESPONSE | jq -r '.data.account_seal')
PAYMENT_ADDRESS=$(echo $PAYMENT_RESPONSE | jq -r '.data.address')

echo "Payment Wallet: $PAYMENT_ADDRESS"
echo "Payment Seal: $PAYMENT_SEAL"

# Step 2: Deploy SimpleDelegate (generates authorized caller)
DEPLOY_RESPONSE=$(curl -s -X POST http://localhost:3000/contracts/deploy \
  -H "X-API-Key: $API_KEY")
AUTHORIZED_SEAL=$(echo $DEPLOY_RESPONSE | jq -r '.data.authorized_caller.account_seal')
DELEGATE_ADDRESS=$(echo $DEPLOY_RESPONSE | jq -r '.data.deployments.successful[0].contractAddress')

echo "Delegate Address: $DELEGATE_ADDRESS"
echo "Authorized Seal: $AUTHORIZED_SEAL"

# Step 3: Fund payment wallet with USDC on Ethereum and Arbitrum
# (No ETH needed - just tokens!)
echo "Send USDC to: $PAYMENT_ADDRESS"

# Step 4: Execute gasless transfer on all networks
curl -X POST http://localhost:3000/eip7702/transfer \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"payment_wallet_seal\": \"$PAYMENT_SEAL\",
    \"authorized_caller_seal\": \"$AUTHORIZED_SEAL\",
    \"delegate_address\": \"$DELEGATE_ADDRESS\",
    \"token_address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",
    \"recipient_address\": \"0x75a85D0fA257005d4b19f844609cD8f1c2F83f00\",
    \"amount\": \"3000000\"
  }"
```

#### Requirements

- **Payment wallet**: Must hold ERC20 tokens (NO ETH needed!)
- **Authorized caller**: Must have ETH on all networks (pays gas)
- **Delegate address**: SimpleDelegate contract deployed at same address on all networks

---

### GET /eip7702/info

Get information about EIP-7702 capabilities.

#### Request

```bash
curl http://localhost:3000/eip7702/info
```

#### Response

```json
{
  "success": true,
  "data": {
    "description": "EIP-7702 allows EOAs to delegate their code to a smart contract",
    "features": [
      "Gasless transactions - payment wallet does not need ETH",
      "Authorized caller pays for gas on all networks",
      "Execute ERC20 transfers without funding wallets",
      "Works across multiple networks simultaneously"
    ],
    "endpoints": {
      "/eip7702/transfer": "Execute gasless ERC20 transfer"
    }
  }
}
```

---

## Key Management

### POST /keys/generate

Generate a new EOA (Externally Owned Account) with encrypted private key.

#### Request

```bash
curl -X POST http://localhost:3000/keys/generate \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": "0x52a1F8Fa942f444a49ba4E631B396f71f87934Fe",
    "account_seal": "HcGVADasIdsJX+pmIld4rGZzGlllQ6HrS4tOUfnlciM93YF85BdP6ZPj3IIJUkQWXAjxtZkl9fg1oeznuSzchg=="
  }
}
```

**Security:** The `account_seal` is encrypted with `AES_SECRET_KEY` from your `.env`. Store it securely!

---

## Signing

### POST /signing/sign-data

Sign arbitrary hex data with a specific EOA.

#### Request

```bash
curl -X POST http://localhost:3000/signing/sign-data \
  -H "Content-Type: application/json" \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -d '{
    "account_seal": "your-base64-sealed-key",
    "data": "0x1234567890abcdef"
  }'
```

#### Response

```json
{
  "success": true,
  "data": {
    "signature": "0x..."
  }
}
```

---

### POST /signing/sign-authorization

Sign an EIP-7702 authorization tuple.

#### Request

```bash
curl -X POST http://localhost:3000/signing/sign-authorization \
  -H "Content-Type: application/json" \
  -d '{
    "account_seal": "your-base64-sealed-key",
    "contract_address": "0xf6861ef74976a5A4E13f94198A9FfE8Cf19c59bd",
    "chain_id": 1,
    "nonce": 0
  }'
```

#### Response

```json
{
  "success": true,
  "data": {
    "contractAddress": "0xf6861ef74976a5A4E13f94198A9FfE8Cf19c59bd",
    "chainId": 1,
    "nonce": 0,
    "r": "0x318c740047cc1cf128bb0374af96ee0a6106ab659d8b0e0a5a8aea5ce0192b9f",
    "s": "0x3c4a89024ce41504a2125fe36488b219b4e809356ef7ff65f4bd9e77af4b2ea0",
    "v": 28,
    "yParity": 1
  }
}
```

---

## Complete Workflow Example

### Gasless Transfer System Setup

```bash
#!/bin/bash

# Set API key
API_KEY="vault-signer-secret-key-12345"

# 1. Configure deployer in .env
echo "DEPLOYER_PRIVATE_KEY=0xYOUR_KEY" >> .env
echo "ALCHEMY_API_KEY_ETHEREUM=your-key" >> .env
echo "ALCHEMY_API_KEY_ARBITRUM=your-key" >> .env
echo "API_KEY=$API_KEY" >> .env

# 2. Check deployer balance
curl http://localhost:3000/contracts/deployer/balance \
  -H "X-API-Key: $API_KEY"

# 3. Deploy SimpleDelegate to all networks (CREATE2)
DEPLOY=$(curl -s -X POST http://localhost:3000/contracts/deploy \
  -H "X-API-Key: $API_KEY")
AUTHORIZED_SEAL=$(echo $DEPLOY | jq -r '.data.authorized_caller.account_seal')
DELEGATE_ADDR=$(echo $DEPLOY | jq -r '.data.deployments.successful[0].contractAddress')

echo "Contract deployed to: $DELEGATE_ADDR (same on all networks)"
echo "Authorized caller seal: $AUTHORIZED_SEAL"

# 4. Generate payment wallet
PAYMENT=$(curl -s -X POST http://localhost:3000/keys/generate \
  -H "X-API-Key: $API_KEY")
PAYMENT_SEAL=$(echo $PAYMENT | jq -r '.data.account_seal')
PAYMENT_ADDR=$(echo $PAYMENT | jq -r '.data.address')

echo "Payment wallet: $PAYMENT_ADDR"
echo "Fund this address with USDC (no ETH needed!)"

# 5. Execute gasless transfer on all networks
curl -X POST http://localhost:3000/eip7702/transfer \
  -H "Content-Type: application/json" \
  -H "X-API-Key: $API_KEY" \
  -d "{
    \"payment_wallet_seal\": \"$PAYMENT_SEAL\",
    \"authorized_caller_seal\": \"$AUTHORIZED_SEAL\",
    \"delegate_address\": \"$DELEGATE_ADDR\",
    \"token_address\": \"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48\",
    \"recipient_address\": \"0xRECIPIENT\",
    \"amount\": \"1000000\"
  }"
```

---

## Bitcoin Operations

Vault Signer provides full Bitcoin wallet management with support for multiple networks (mainnet, testnet, regtest).

**Network Detection:**
- Development (`NODE_ENV=development`): Uses **regtest** (local testing)
- Production (`NODE_ENV=production`): Uses **mainnet** (live Bitcoin)
- Override: Set `BITCOIN_NETWORK=testnet` in `.env`

**Address Formats:**
- Mainnet: `bc1...` (bech32 native SegWit)
- Testnet: `tb1...` (bech32 native SegWit)
- Regtest: `bcrt1...` (bech32 native SegWit)

---

### POST /bitcoin/transfer

Transfer Bitcoin from a wallet to a recipient address. Supports both sweep (send all) and specific amount transfers.

#### Request (Sweep All Funds)

```bash
curl -X POST http://localhost:3000/bitcoin/transfer \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "account_seal": "bqogeyuuMeLTKvkQaDdRl7uioMkO/6q8DHT9OtXTAm5inq6XzcqZ0FcBhDhsXt9i8lzccOLjBf2/KN0frUPaEA==",
    "recipient_address": "bcrt1qnywjlxl3yrt7vuyphpn9fel40cckkxex874fr5"
  }'
```

#### Request (Send Specific Amount)

```bash
curl -X POST http://localhost:3000/bitcoin/transfer \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "account_seal": "bqogeyuuMeLTKvkQaDdRl7uioMkO/6q8DHT9OtXTAm5inq6XzcqZ0FcBhDhsXt9i8lzccOLjBf2/KN0frUPaEA==",
    "recipient_address": "bcrt1qnywjlxl3yrt7vuyphpn9fel40cckkxex874fr5",
    "amount_sats": 100000000
  }'
```

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `account_seal` | string | Yes | Encrypted multi-chain wallet keys (see [SEAL_ENCRYPTION.md](SEAL_ENCRYPTION.md)) |
| `recipient_address` | string | Yes | Bitcoin address to send funds to |
| `amount_sats` | number | No | Amount in satoshis. If omitted, sweeps all funds (minus fees) |

#### Response

```json
{
  "success": true,
  "data": {
    "txid": "6c1b6c1cd96a4069b6fe90af0be4509fb7f132ffb49443f3b6b1e6e7ef9dfcf6",
    "sender_address": "bcrt1q66xx7s8v9tgkn9qhlmqtyyrzum2qt6zzka4a5v",
    "recipient_address": "bcrt1qnywjlxl3yrt7vuyphpn9fel40cckkxex874fr5",
    "amount_sent_sats": 199999848,
    "total_input_sats": 200000000,
    "sweep": true,
    "fee_rate_sat_vb": 1,
    "network": "regtest",
    "explorer_url": "https://blockstream.info/testnet/tx/6c1b6c1cd96a4069b6fe90af0be4509fb7f132ffb49443f3b6b1e6e7ef9dfcf6"
  }
}
```

**Response Fields:**
- `txid`: Transaction ID (hash) of the broadcast transaction
- `sender_address`: Bitcoin address that sent the funds
- `recipient_address`: Bitcoin address that received the funds
- `amount_sent_sats`: Actual amount sent in satoshis (excluding fees)
- `total_input_sats`: Total input value from UTXOs
- `sweep`: `true` if all funds were swept, `false` if specific amount
- `fee_rate_sat_vb`: Fee rate in satoshis per virtual byte
- `network`: Bitcoin network used (mainnet/testnet/regtest)
- `explorer_url`: Blockchain explorer link

#### What It Does

1. **Unseals** the account_seal to get Bitcoin private key
2. **Derives** Bitcoin address from private key
3. **Fetches** available UTXOs (Unspent Transaction Outputs)
4. **Estimates** transaction fee based on current network rates
5. **Creates** transaction:
   - Sweep mode: Sends all funds minus fee (1 output)
   - Amount mode: Sends specific amount with change (2 outputs)
6. **Signs** transaction with private key
7. **Broadcasts** to Bitcoin network
8. **Returns** transaction ID and details

---

### GET /bitcoin/balance/:address

Get Bitcoin balance for a specific address.

#### Request

```bash
curl http://localhost:3000/bitcoin/balance/bcrt1q66xx7s8v9tgkn9qhlmqtyyrzum2qt6zzka4a5v \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": "bcrt1q66xx7s8v9tgkn9qhlmqtyyrzum2qt6zzka4a5v",
    "balance_sats": 200000000,
    "confirmed_sats": 200000000,
    "unconfirmed_sats": 0,
    "balance_btc": "2.00000000",
    "network": "regtest"
  }
}
```

**Response Fields:**
- `address`: Bitcoin address queried
- `balance_sats`: Total balance in satoshis (confirmed + unconfirmed)
- `confirmed_sats`: Confirmed balance in satoshis
- `unconfirmed_sats`: Unconfirmed (pending) balance in satoshis
- `balance_btc`: Total balance in BTC (formatted with 8 decimals)
- `network`: Bitcoin network (mainnet/testnet/regtest)

**Conversion:**
- 1 BTC = 100,000,000 satoshis
- 0.001 BTC = 100,000 satoshis

---

### GET /bitcoin/utxos/:address

Get unspent transaction outputs (UTXOs) for an address.

#### Request

```bash
curl http://localhost:3000/bitcoin/utxos/bcrt1q66xx7s8v9tgkn9qhlmqtyyrzum2qt6zzka4a5v \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": "bcrt1q66xx7s8v9tgkn9qhlmqtyyrzum2qt6zzka4a5v",
    "utxo_count": 1,
    "total_value_sats": 200000000,
    "total_value_btc": "2.00000000",
    "utxos": [
      {
        "txid": "8d799fb969fe57f5f3ac24e88f073b12e2bfccef9c0edecf8675d471ea4e659f",
        "vout": 0,
        "value_sats": 200000000,
        "value_btc": "2.00000000",
        "confirmed": true,
        "block_height": 211
      }
    ],
    "network": "regtest"
  }
}
```

**Response Fields:**
- `utxo_count`: Number of unspent outputs
- `total_value_sats`: Sum of all UTXO values in satoshis
- `total_value_btc`: Sum of all UTXO values in BTC
- `utxos`: Array of UTXO objects
  - `txid`: Transaction ID where the output was created
  - `vout`: Output index within the transaction
  - `value_sats`: Value of this UTXO in satoshis
  - `confirmed`: Whether the transaction is confirmed
  - `block_height`: Block height of confirmation

**Use Case:**
- Check available outputs before creating transactions
- Verify funds are confirmed
- Debug transaction issues

---

### POST /bitcoin/estimate-fee

Estimate transaction fee for a Bitcoin transfer.

#### Request (Sweep Estimation)

```bash
curl -X POST http://localhost:3000/bitcoin/estimate-fee \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "bcrt1q66xx7s8v9tgkn9qhlmqtyyrzum2qt6zzka4a5v",
    "recipient_address": "bcrt1qnywjlxl3yrt7vuyphpn9fel40cckkxex874fr5"
  }'
```

#### Request (Specific Amount Estimation)

```bash
curl -X POST http://localhost:3000/bitcoin/estimate-fee \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "bcrt1q66xx7s8v9tgkn9qhlmqtyyrzum2qt6zzka4a5v",
    "recipient_address": "bcrt1qnywjlxl3yrt7vuyphpn9fel40cckkxex874fr5",
    "amount_sats": 100000000
  }'
```

#### Response

```json
{
  "success": true,
  "data": {
    "address": "bcrt1q66xx7s8v9tgkn9qhlmqtyyrzum2qt6zzka4a5v",
    "total_balance_sats": 200000000,
    "utxo_count": 1,
    "fee_estimates": {
      "fastest": {
        "fee_sats": 152,
        "fee_rate_sat_vb": 1,
        "eta": "Next block (~10 min)"
      },
      "half_hour": {
        "fee_sats": 152,
        "fee_rate_sat_vb": 1,
        "eta": "~30 minutes (3 blocks)"
      },
      "hour": {
        "fee_sats": 152,
        "fee_rate_sat_vb": 1,
        "eta": "~1 hour (6 blocks)"
      },
      "economy": {
        "fee_sats": 152,
        "fee_rate_sat_vb": 1,
        "eta": "~1 day (144 blocks)"
      }
    },
    "recommended": "half_hour",
    "network": "regtest"
  }
}
```

**Response Fields:**
- `fee_estimates`: Fee estimates for different confirmation speeds
  - `fastest`: Next block confirmation
  - `half_hour`: ~3 blocks (~30 minutes)
  - `hour`: ~6 blocks (~60 minutes)
  - `economy`: ~144 blocks (~24 hours)
- Each estimate includes:
  - `fee_sats`: Estimated fee in satoshis
  - `fee_rate_sat_vb`: Fee rate in sat/vByte
  - `eta`: Estimated time to confirmation
- `recommended`: Suggested fee tier (default: half_hour)

**Fee Calculation:**
- Transaction size = (inputs × 110 vB) + (outputs × 31 vB) + 11 vB overhead
- Fee = size × fee_rate
- Dynamically adjusts for sweep (1 output) vs amount (2 outputs)

---

### POST /bitcoin/broadcast

Broadcast a raw signed Bitcoin transaction to the network.

#### Request

```bash
curl -X POST http://localhost:3000/bitcoin/broadcast \
  -H "X-API-Key: vault-signer-secret-key-12345" \
  -H "Content-Type: application/json" \
  -d '{
    "tx_hex": "020000000001010c743357ef375d6efdc9e07b50db4b68fcaf046a6cd6544fd3009ca4aee624740100000000ffffffff73a8..."
  }'
```

#### Response

```json
{
  "success": true,
  "data": {
    "txid": "6c1b6c1cd96a4069b6fe90af0be4509fb7f132ffb49443f3b6b1e6e7ef9dfcf6",
    "network": "regtest",
    "explorer_url": "https://blockstream.info/testnet/tx/6c1b6c1cd96a4069b6fe90af0be4509fb7f132ffb49443f3b6b1e6e7ef9dfcf6"
  }
}
```

**Use Case:**
- Advanced users who want to construct transactions offline
- Broadcasting pre-signed transactions
- Integration with hardware wallets

---

### GET /bitcoin/transaction/:txid

Get Bitcoin transaction details and confirmation status.

#### Request

```bash
curl http://localhost:3000/bitcoin/transaction/6c1b6c1cd96a4069b6fe90af0be4509fb7f132ffb49443f3b6b1e6e7ef9dfcf6 \
  -H "X-API-Key: vault-signer-secret-key-12345"
```

#### Response

```json
{
  "success": true,
  "data": {
    "txid": "6c1b6c1cd96a4069b6fe90af0be4509fb7f132ffb49443f3b6b1e6e7ef9dfcf6",
    "confirmed": true,
    "confirmations": 6,
    "block_height": 212,
    "transaction": {
      "txid": "6c1b6c1cd96a4069b6fe90af0be4509fb7f132ffb49443f3b6b1e6e7ef9dfcf6",
      "version": 2,
      "locktime": 0,
      "vin": [...],
      "vout": [...],
      "size": 141,
      "weight": 561,
      "fee": 152
    },
    "network": "regtest",
    "explorer_url": "https://blockstream.info/testnet/tx/6c1b6c1cd96a4069b6fe90af0be4509fb7f132ffb49443f3b6b1e6e7ef9dfcf6"
  }
}
```

**Response Fields:**
- `confirmed`: Whether transaction is confirmed
- `confirmations`: Number of confirmations (blocks after tx)
- `block_height`: Block height where tx was included
- `transaction`: Full transaction details from blockchain

**Confirmation Guidelines:**
- 0 confirmations: Unconfirmed (in mempool)
- 1 confirmation: Included in latest block
- 3 confirmations: Reasonably safe for small amounts
- 6+ confirmations: Standard for larger amounts

---

## Bitcoin Complete Example

### Generate Multi-Chain Wallet and Send Bitcoin

```bash
#!/bin/bash

API_KEY="vault-signer-secret-key-12345"
API_URL="http://localhost:3000"

# 1. Generate multi-chain wallet (EVM + Bitcoin)
echo "Generating wallet..."
WALLET=$(curl -s -X POST $API_URL/keys/generate \
  -H "X-API-Key: $API_KEY")

ACCOUNT_SEAL=$(echo $WALLET | jq -r '.data.account_seal')
BTC_ADDRESS=$(echo $WALLET | jq -r '.data.bitcoin.address')
EVM_ADDRESS=$(echo $WALLET | jq -r '.data.evm.address')

echo "Bitcoin Address: $BTC_ADDRESS"
echo "EVM Address: $EVM_ADDRESS"
echo "Account Seal: $ACCOUNT_SEAL"
echo ""

# 2. Check Bitcoin balance
echo "Checking balance..."
curl -s "$API_URL/bitcoin/balance/$BTC_ADDRESS" \
  -H "X-API-Key: $API_KEY" | jq .
echo ""

# 3. Fund the Bitcoin address
# (In regtest: npm run bitcoin:send $BTC_ADDRESS 5.0)
# (In testnet: Use a faucet)
# (In mainnet: Send real BTC)
echo "Fund $BTC_ADDRESS with Bitcoin, then press Enter..."
read

# 4. Check balance after funding
echo "Checking balance after funding..."
BALANCE=$(curl -s "$API_URL/bitcoin/balance/$BTC_ADDRESS" \
  -H "X-API-Key: $API_KEY")
echo $BALANCE | jq .
BALANCE_SATS=$(echo $BALANCE | jq -r '.data.balance_sats')
echo "Balance: $BALANCE_SATS satoshis"
echo ""

# 5. Get UTXOs
echo "Fetching UTXOs..."
curl -s "$API_URL/bitcoin/utxos/$BTC_ADDRESS" \
  -H "X-API-Key: $API_KEY" | jq .
echo ""

# 6. Estimate fee for sending 1 BTC
echo "Estimating fee for sending 1 BTC..."
curl -s -X POST "$API_URL/bitcoin/estimate-fee" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"address\": \"$BTC_ADDRESS\",
    \"recipient_address\": \"bcrt1qnywjlxl3yrt7vuyphpn9fel40cckkxex874fr5\",
    \"amount_sats\": 100000000
  }" | jq .
echo ""

# 7. Transfer 1 BTC
echo "Transferring 1 BTC..."
TX_RESULT=$(curl -s -X POST "$API_URL/bitcoin/transfer" \
  -H "X-API-Key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"account_seal\": \"$ACCOUNT_SEAL\",
    \"recipient_address\": \"bcrt1qnywjlxl3yrt7vuyphpn9fel40cckkxex874fr5\",
    \"amount_sats\": 100000000
  }")

echo $TX_RESULT | jq .
TXID=$(echo $TX_RESULT | jq -r '.data.txid')
echo ""

# 8. Check transaction status
echo "Checking transaction status..."
sleep 2
curl -s "$API_URL/bitcoin/transaction/$TXID" \
  -H "X-API-Key: $API_KEY" | jq .
echo ""

# 9. Check final balance
echo "Checking final balance..."
curl -s "$API_URL/bitcoin/balance/$BTC_ADDRESS" \
  -H "X-API-Key: $API_KEY" | jq .

echo ""
echo "✅ Bitcoin transfer complete!"
echo "Transaction ID: $TXID"
```

---

## Bitcoin Testing (Regtest)

For local development and testing, use Bitcoin regtest mode:

```bash
# Start Bitcoin regtest (auto-generates 1000 spendable BTC)
npm run bitcoin:start

# Send Bitcoin to any address
npm run bitcoin:send bcrt1qXXXXX... 5.0

# Mine a block
npm run bitcoin:mine

# Check regtest wallet balance
npm run bitcoin:balance

# Stop Bitcoin
npm run bitcoin:stop
```

**Testing Guides:**
- [Quick Start](QUICK_START_BITCOIN.md) - Quick reference commands
- [Manual Testing](BITCOIN_MANUAL_TEST.md) - Complete testing guide
- [Regtest Setup](BITCOIN_REGTEST_SETUP.md) - Installation and setup

---


## Security Best Practices

### Private Key Management

⚠️ **DEPLOYER_PRIVATE_KEY**
- Store in `.env`, never commit to git
- Use hardware wallet or secrets manager
- Fund with minimal ETH needed
- Rotate if compromised

⚠️ **AUTHORIZED_CALLER**
- Generated fresh for each deployment
- `account_seal` encrypted with `AES_SECRET_KEY`
- Store securely - needed for all gasless transfers
- Has spending power over payment wallets

⚠️ **PAYMENT_WALLET**
- Holds tokens but no ETH
- `account_seal` grants access to tokens
- Store securely in your application database


## Troubleshooting

### "DEPLOYER_PRIVATE_KEY not configured"
Add to `.env`:
```bash
DEPLOYER_PRIVATE_KEY=0xyour-private-key
```

### "insufficient funds for transfer"
- Authorized caller needs ETH on the network
- Check balance: `GET /contracts/deployer/balance`
- Fund authorized caller address

### "Execution reverted"
- Payment wallet may not have enough tokens
- Check token balance on blockchain explorer
- Verify token address is correct for the network

### Different addresses on different networks
This shouldn't happen with CREATE2! If it does:
- Verify same bytecode was deployed
- Check CREATE2 factory exists on both networks
- Ensure same salt was used

---

## Additional Resources

- [EIP-7702 Gasless Transfers Guide](EIP7702_GASLESS_TRANSFERS.md)
- [Updated API Flow](UPDATED_API_FLOW.md)
- [SimpleDelegate Contract](contracts/contracts/SimpleDelegate.sol)
- [Network Configuration](src/services/networks.ts)

---

## Support

For questions or issues:
- Check documentation in this repository
- Review code examples above
- Test on testnet first before mainnet
