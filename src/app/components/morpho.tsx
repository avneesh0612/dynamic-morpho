import React, { useState } from "react";
import { useAccount, useWriteContract, useReadContract } from "wagmi";
import { parseUnits, formatUnits } from "viem";
import { base } from "viem/chains";

const SUPPORTED_NETWORK = base;
const MORPHO_USDC_VAULT_ADDRESS = "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A";

// Minimal ERC20 ABI for approve, allowance, balanceOf, decimals
const ERC20_ABI = [
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    type: "function",
  },
];

// Minimal ERC4626 ABI for deposit, withdraw, balanceOf, previewDeposit, previewWithdraw
const ERC4626_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "assets", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
    ],
    name: "deposit",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { internalType: "uint256", name: "shares", type: "uint256" },
      { internalType: "address", name: "receiver", type: "address" },
      { internalType: "address", name: "owner", type: "address" },
    ],
    name: "withdraw",
    outputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ internalType: "address", name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    name: "previewDeposit",
    outputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "shares", type: "uint256" }],
    name: "previewWithdraw",
    outputs: [{ internalType: "uint256", name: "assets", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export default function MorphoEarnPage() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

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

  // Approve USDC
  const {
    writeContract: writeApprove,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract();

  // Deposit
  const {
    writeContract: writeDeposit,
    isPending: isDepositing,
    error: depositError,
  } = useWriteContract();

  // Withdraw
  const {
    writeContract: writeWithdraw,
    isPending: isWithdrawing,
    error: withdrawError,
  } = useWriteContract();

  const decimals = 6; // USDC decimals

  const handleApprove = async () => {
    setTxStatus("");
    try {
      await writeApprove({
        address: USDC_ADDRESS as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [MORPHO_USDC_VAULT_ADDRESS, parseUnits(amount, decimals)],
      });
      setTxStatus("Approval transaction sent!");
    } catch (e: unknown) {
      setTxStatus(
        "Approval failed: " +
          (e && typeof e === "object" && "message" in e
            ? (e as { message?: string }).message
            : String(e))
      );
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus("");
    try {
      await writeDeposit({
        address: MORPHO_USDC_VAULT_ADDRESS as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: "deposit",
        args: [parseUnits(amount, decimals), address],
      });
      setTxStatus("Deposit transaction sent!");
    } catch (e: unknown) {
      setTxStatus(
        "Deposit failed: " +
          (e && typeof e === "object" && "message" in e
            ? (e as { message?: string }).message
            : String(e))
      );
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus("");
    try {
      // Withdraw by shares (1:1 for USDC vaults)
      await writeWithdraw({
        address: MORPHO_USDC_VAULT_ADDRESS as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: "withdraw",
        args: [parseUnits(amount, decimals), address, address],
      });
      setTxStatus("Withdraw transaction sent!");
    } catch (e: unknown) {
      setTxStatus(
        "Withdraw failed: " +
          (e && typeof e === "object" && "message" in e
            ? (e as { message?: string }).message
            : String(e))
      );
    }
  };

  const needsApproval =
    allowance !== undefined &&
    parseUnits(amount || "0", decimals) > (allowance as bigint);

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        margin: "40px auto",
        padding: 32,
        background: "#f7f7f7",
        borderRadius: 16,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <h2
        style={{
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 8,
          textAlign: "center",
          color: "#232323", // darker for contrast
        }}
      >
        Morpho x Dynamic
      </h2>
      <div
        style={{ marginBottom: 24, display: "flex", justifyContent: "center" }}
      >
        <button
          onClick={() => setMode("deposit")}
          style={{
            marginRight: 8,
            fontWeight: mode === "deposit" ? "bold" : undefined,
            background: mode === "deposit" ? "#0051b3" : "#e0e0e0",
            color: mode === "deposit" ? "#fff" : "#232323",
            border: "none",
            borderRadius: 6,
            padding: "8px 18px",
            cursor: "pointer",
            transition: "background 0.2s",
            outline: mode === "deposit" ? "2px solid #003366" : undefined,
          }}
        >
          Deposit
        </button>
        <button
          onClick={() => setMode("withdraw")}
          style={{
            fontWeight: mode === "withdraw" ? "bold" : undefined,
            background: mode === "withdraw" ? "#0051b3" : "#e0e0e0",
            color: mode === "withdraw" ? "#fff" : "#232323",
            border: "none",
            borderRadius: 6,
            padding: "8px 18px",
            cursor: "pointer",
            transition: "background 0.2s",
            outline: mode === "withdraw" ? "2px solid #003366" : undefined,
          }}
        >
          Withdraw
        </button>
      </div>
      <form
        onSubmit={mode === "deposit" ? handleDeposit : handleWithdraw}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          type="number"
          min="0"
          step="any"
          placeholder={
            mode === "deposit" ? "Amount in USDC" : "Shares to withdraw"
          }
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{
            padding: 14,
            borderRadius: 8,
            border: "1px solid #888",
            fontSize: 16,
            marginBottom: 4,
            color: "#232323",
            background: "#f4f4f4",
          }}
        />
        {mode === "deposit" && needsApproval && (
          <button
            type="button"
            onClick={handleApprove}
            disabled={isApproving}
            style={{
              background: "#ff9800",
              color: "#232323",
              border: "none",
              borderRadius: 6,
              padding: "10px 0",
              fontWeight: 600,
              fontSize: 16,
              cursor: isApproving ? "not-allowed" : "pointer",
              marginBottom: 4,
              outline: isApproving ? undefined : "2px solid #b36b00",
            }}
          >
            {isApproving ? "Approving..." : "Approve USDC"}
          </button>
        )}
        <button
          type="submit"
          disabled={
            !isConnected ||
            (mode === "deposit" && (isDepositing || needsApproval)) ||
            (mode === "withdraw" && isWithdrawing)
          }
          style={{
            background: "#0051b3",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "12px 0",
            fontWeight: 600,
            fontSize: 16,
            cursor:
              !isConnected ||
              (mode === "deposit" && (isDepositing || needsApproval)) ||
              (mode === "withdraw" && isWithdrawing)
                ? "not-allowed"
                : "pointer",
            marginBottom: 4,
            outline:
              !isConnected ||
              (mode === "deposit" && (isDepositing || needsApproval)) ||
              (mode === "withdraw" && isWithdrawing)
                ? undefined
                : "2px solid #003366",
          }}
        >
          {mode === "deposit"
            ? isDepositing
              ? "Depositing..."
              : "Deposit"
            : isWithdrawing
            ? "Withdrawing..."
            : "Withdraw"}
        </button>
      </form>
      <div style={{ marginTop: 20, marginBottom: 8, fontSize: 15 }}>
        <div>
          <span style={{ color: "#444" }}>Your USDC balance:</span>{" "}
          <span style={{ fontWeight: 600, color: "#232323" }}>
            {usdcBalance ? formatUnits(usdcBalance as bigint, decimals) : "-"}
          </span>
        </div>
        <div>
          <span style={{ color: "#444" }}>Your vault shares:</span>{" "}
          <span style={{ fontWeight: 600, color: "#232323" }}>
            {vaultBalance ? formatUnits(vaultBalance as bigint, decimals) : "-"}
          </span>
        </div>
      </div>
      {txStatus && (
        <div
          style={{
            marginTop: 16,
            color: txStatus.toLowerCase().includes("fail")
              ? "#d32f2f"
              : "#388e3c",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          {txStatus}
        </div>
      )}
      {(approveError || depositError || withdrawError) && (
        <div
          style={{
            color: "#d32f2f",
            marginTop: 12,
            fontWeight: 500,
            background: "#fff0f0",
            borderRadius: 8,
            padding: 10,
            textAlign: "center",
          }}
        >
          {approveError && <div>Approve Error: {approveError.message}</div>}
          {depositError && <div>Deposit Error: {depositError.message}</div>}
          {withdrawError && <div>Withdraw Error: {withdrawError.message}</div>}
        </div>
      )}
    </div>
  );
}
