# Morpho Lending Integration Guide

A comprehensive technical guide for integrating Morpho lending vaults with Dynamic's MPC embedded wallets.

**[📺 Watch Video](https://www.loom.com/share/b1ecee08e478480e92e3662a5b66846d?sid=aa0f3601-6524-4db7-83a6-63ca2388a151)**

## Architecture Overview

The lending flow consists of three main components:

1. **Dynamic MPC Wallet** - Provides embedded, non-custodial wallets
2. **Morpho Protocol** - Decentralized lending protocol with optimized yields
3. **Morpho GraphQL API** - Real-time vault data and user positions

## Setup and Dependencies

```bash
bun install @dynamic-labs/sdk-react-core wagmi viem
```

Key imports:

```typescript
import { formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
```

## 1. Dynamic MPC Wallet Integration

Users authenticate and receive an embedded wallet through Dynamic's MPC system:

```typescript
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

<DynamicWidget />;
```

The wallet provides:

- **Non-custodial security** - Private keys split via MPC
- **Seamless UX** - No browser extensions required
- **Balance tracking** - Real-time token balances

## 2. Morpho Vault Configuration

Configure the vault address and token contracts:

```typescript
const MORPHO_USDC_VAULT_ADDRESS = "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
```

## 3. Reading Vault Data

### Fetch User Position

Get the user's current position in the vault:

```typescript
const fetchUserPosition = async (userAddress: string) => {
  try {
    const res = await fetch("https://api.morpho.org/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `query GetAllUserPositions($chainId: Int!, $userAddress: String!) {
          vaultPositions(where: {chainId_in: [$chainId], shares_gte: 0, userAddress_in: [$userAddress]}) {
            items {
              state {
                assets
                assetsUsd
              }
              vault { 
                address 
                name 
                symbol 
              }
            }
          }
        }`,
        variables: {
          chainId: 8453, // Base chain ID
          userAddress: userAddress,
        },
      }),
    });

    const json = await res.json();
    const items = json?.data?.vaultPositions?.items;

    const vaultItem = items?.find(
      (item) =>
        item.vault?.address?.toLowerCase() ===
        MORPHO_USDC_VAULT_ADDRESS.toLowerCase()
    );

    if (vaultItem && vaultItem.state) {
      return {
        assets: vaultItem.state.assets,
        assetsUsd: vaultItem.state.assetsUsd,
        vaultName: vaultItem.vault?.name,
        vaultSymbol: vaultItem.vault?.symbol,
      };
    }
  } catch (error) {
    console.error("Failed to fetch user position:", error);
  }
  return null;
};
```

## 4. Contract Interactions

### Reading Balances and Allowances

```typescript
const { address, isConnected } = useAccount();

// Read USDC balance
const { data: usdcBalance } = useReadContract({
  address: USDC_ADDRESS as `0x${string}`,
  abi: ERC20_ABI,
  functionName: "balanceOf",
  args: address ? [address] : undefined,
  query: { enabled: !!address },
});

// Read vault share balance
const { data: vaultBalance } = useReadContract({
  address: MORPHO_USDC_VAULT_ADDRESS as `0x${string}`,
  abi: ERC4626_ABI,
  functionName: "balanceOf",
  args: address ? [address] : undefined,
  query: { enabled: !!address },
});

// Read allowance
const { data: allowance } = useReadContract({
  address: USDC_ADDRESS as `0x${string}`,
  abi: ERC20_ABI,
  functionName: "allowance",
  args: address ? [address, MORPHO_USDC_VAULT_ADDRESS] : undefined,
  query: { enabled: !!address },
});
```

### Token Approval

Before depositing, users must approve the vault to spend their tokens:

```typescript
const {
  writeContract: writeApprove,
  isPending: isApproving,
  error: approveError,
} = useWriteContract();

const handleApprove = async (amount: string) => {
  try {
    await writeApprove({
      address: USDC_ADDRESS as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [MORPHO_USDC_VAULT_ADDRESS, parseUnits(amount, 6)], // USDC has 6 decimals
    });
  } catch (error) {
    console.error("Approval failed:", error);
  }
};

// Check if approval is needed
const needsApproval = (amount: string) => {
  const parsedAmount = parseUnits(amount || "0", 6);
  return allowance !== undefined && parsedAmount > (allowance as bigint);
};
```

## 5. Deposit Operations

Deposit assets into the Morpho vault:

```typescript
const {
  writeContract: writeDeposit,
  isPending: isDepositing,
  error: depositError,
} = useWriteContract();

const handleDeposit = async (amount: string) => {
  try {
    await writeDeposit({
      address: MORPHO_USDC_VAULT_ADDRESS as `0x${string}`,
      abi: ERC4626_ABI,
      functionName: "deposit",
      args: [parseUnits(amount, 6), address], // assets, receiver
    });
  } catch (error) {
    console.error("Deposit failed:", error);
  }
};
```

## 6. Withdraw Operations

Withdraw assets from the Morpho vault:

```typescript
const {
  writeContract: writeWithdraw,
  isPending: isWithdrawing,
  error: withdrawError,
} = useWriteContract();

const handleWithdraw = async (amount: string) => {
  try {
    await writeWithdraw({
      address: MORPHO_USDC_VAULT_ADDRESS as `0x${string}`,
      abi: ERC4626_ABI,
      functionName: "withdraw",
      args: [
        parseUnits(amount, 6), // assets
        address, // receiver
        address, // owner
      ],
    });
  } catch (error) {
    console.error("Withdraw failed:", error);
  }
};
```

## Network Configuration

Base network (Chain ID: 8453):

- **USDC Token**: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`
- **Morpho USDC Vault**: `0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A`
- **Morpho GraphQL API**: `https://api.morpho.org/graphql`

## Transaction Flow Summary

1. User connects via Dynamic MPC wallet
2. Select deposit or withdraw mode
3. Enter the amount to deposit/withdraw
4. Check and handle token approvals (deposit only)
5. Execute vault transaction via ERC-4626 interface
6. Display transaction status and updated balances
7. Query GraphQL API for real-time position data

## Getting Started

First, run the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Key Features

- **ERC-4626 Compliance** - Standard vault interface for deposits/withdrawals
- **Real-time Data** - GraphQL API integration for live vault metrics
- **Optimized Yields** - Morpho's lending optimization algorithms
- **Non-custodial** - Dynamic MPC wallets maintain user control

## References

- [Dynamic Documentation](https://docs.dynamic.xyz)
- [Depositing and withdrawing from Morpho vaults](https://docs.morpho.org/build/earn/tutorials/assets-flow)
- [Getting Morpho data](https://docs.morpho.org/build/earn/tutorials/get-data)
