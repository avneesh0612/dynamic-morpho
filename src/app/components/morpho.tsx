import { ERC20_ABI } from "@/lib/ERC20_ABI";
import { ERC4626_ABI } from "@/lib/ERC4626_ABI";
import React, { useState, useEffect } from "react";
import { formatUnits, parseUnits } from "viem";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

const MORPHO_USDC_VAULT_ADDRESS = "0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A";
const USDC_ADDRESS = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export default function MorphoEarnPage() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");
  const [userAssets, setUserAssets] = useState<string | null>(null);
  const [userAssetsUsd, setUserAssetsUsd] = useState<string | null>(null);
  const [vaultName, setVaultName] = useState<string | null>(null);
  const [vaultSymbol, setVaultSymbol] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserPosition() {
      if (!address) return;
      try {
        const res = await fetch("https://api.morpho.org/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query GetAllUserPositions($chainId: Int!, $userAddress: String!) {\n  vaultPositions(where: {chainId_in: [$chainId], shares_gte: 0, userAddress_in: [$userAddress]}) {\n    items {\n      id\n      state {\n        shares\n        assets\n        assetsUsd\n        id\n        pnl\n        pnlUsd\n        roe\n        roeUsd\n        shares\n        timestamp\n      }\n      user { id }\n      vault { id address name symbol }\n    }\n  }\n}`,
            variables: {
              chainId: 8453, // Base chainId
              userAddress: address,
            },
          }),
        });
        const json = await res.json();
        type VaultPositionItem = {
          vault?: { address?: string; name?: string; symbol?: string };
          state?: { assets?: number; assetsUsd?: number };
        };
        const items: VaultPositionItem[] | undefined =
          json?.data?.vaultPositions?.items;
        const vaultItem = items?.find(
          (item) =>
            item.vault?.address?.toLowerCase() ===
            MORPHO_USDC_VAULT_ADDRESS.toLowerCase()
        );
        if (vaultItem && vaultItem.state) {
          // assets is in base units (e.g., 1000336 for 1.000336 USDC)
          const assets = vaultItem.state.assets;
          let formattedAssets = null;
          if (typeof assets === "number" && !isNaN(assets)) {
            formattedAssets = (assets / 1e6).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }
          setUserAssets(formattedAssets);
          setUserAssetsUsd(
            typeof vaultItem.state.assetsUsd === "number"
              ? `$${vaultItem.state.assetsUsd.toLocaleString(undefined, {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6,
                })}`
              : null
          );
          setVaultName(vaultItem.vault?.name ?? null);
          setVaultSymbol(vaultItem.vault?.symbol ?? null);
        } else {
          setUserAssets(null);
          setUserAssetsUsd(null);
          setVaultName(null);
          setVaultSymbol(null);
        }
      } catch {
        setUserAssets(null);
        setUserAssetsUsd(null);
        setVaultName(null);
        setVaultSymbol(null);
      }
    }
    fetchUserPosition();
  }, [address]);

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
    <>
      <h2
        style={{
          fontSize: 36,
          fontWeight: 800,
          marginBottom: 32,
          textAlign: "center",
          color: "#fff",
          letterSpacing: 0.5,
          textShadow: "0 2px 8px rgba(0,0,0,0.18)",
        }}
      >
        Morpho x Dynamic
      </h2>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          margin: "0 auto",
          padding: 32,
          background: "#23242a",
          borderRadius: 20,
          boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
          fontFamily: "Inter, sans-serif",
          color: "#f3f6fa",
        }}
      >
        {vaultName && (
          <div style={{ marginBottom: 8 }}>
            <h3 style={{ color: "#fff", fontWeight: 700, textAlign: "center" }}>
              {vaultName} ({vaultSymbol})
            </h3>
          </div>
        )}
        <div
          style={{
            marginBottom: 24,
            display: "flex",
            gap: 12,
            width: "100%",
          }}
        >
          <button
            onClick={() => setMode("deposit")}
            style={{
              flex: 1,
              fontWeight: mode === "deposit" ? "bold" : undefined,
              background: mode === "deposit" ? "#1561d6" : "#35363c",
              color: mode === "deposit" ? "#fff" : "#bfc7d5",
              border: "none",
              borderRadius: 8,
              padding: "14px 0",
              cursor: "pointer",
              transition: "background 0.2s",
              outline: mode === "deposit" ? "2px solid #3a8bfd" : undefined,
              fontSize: 17,
            }}
          >
            Deposit
          </button>
          <button
            onClick={() => setMode("withdraw")}
            style={{
              flex: 1,
              fontWeight: mode === "withdraw" ? "bold" : undefined,
              background: mode === "withdraw" ? "#1561d6" : "#35363c",
              color: mode === "withdraw" ? "#fff" : "#bfc7d5",
              border: "none",
              borderRadius: 8,
              padding: "14px 0",
              cursor: "pointer",
              transition: "background 0.2s",
              outline: mode === "withdraw" ? "2px solid #3a8bfd" : undefined,
              fontSize: 17,
            }}
          >
            Withdraw
          </button>
        </div>
        <form
          onSubmit={mode === "deposit" ? handleDeposit : handleWithdraw}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <input
            type="number"
            min="0"
            step="any"
            placeholder="Amount in USDC"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            style={{
              padding: 16,
              borderRadius: 8,
              border: "1.5px solid #3a3b40",
              fontSize: 17,
              marginBottom: 4,
              color: "#f3f6fa",
              background: "#18181b",
              outline: "none",
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
            }}
          />
          {mode === "deposit" && needsApproval && (
            <button
              type="button"
              onClick={handleApprove}
              disabled={isApproving}
              style={{
                background: "#ffb300",
                color: "#232323",
                border: "none",
                borderRadius: 8,
                padding: "12px 0",
                fontWeight: 600,
                fontSize: 17,
                cursor: isApproving ? "not-allowed" : "pointer",
                marginBottom: 4,
                outline: isApproving ? undefined : "2px solid #b36b00",
                boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
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
              background: "#1561d6",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "14px 0",
              fontWeight: 700,
              fontSize: 18,
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
                  : "2px solid #3a8bfd",
              boxShadow: "0 1px 4px rgba(0,0,0,0.10)",
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
        <div style={{ marginTop: 24, marginBottom: 8, fontSize: 16 }}>
          <div>
            <span style={{ color: "#bfc7d5" }}>Your USDC balance:</span>{" "}
            <span style={{ fontWeight: 700, color: "#fff" }}>
              {usdcBalance ? formatUnits(usdcBalance as bigint, decimals) : "-"}
            </span>
          </div>
          <div>
            <span style={{ color: "#bfc7d5" }}>Your vault shares:</span>{" "}
            <span style={{ fontWeight: 700, color: "#fff" }}>
              {vaultBalance
                ? formatUnits(vaultBalance as bigint, decimals)
                : "-"}
            </span>
          </div>

          <div>
            <span style={{ color: "#bfc7d5" }}>
              Your vault position (USDC):
            </span>{" "}
            <span style={{ fontWeight: 700, color: "#fff" }}>
              {userAssets === null ? "-" : userAssets}
            </span>
          </div>
          <div>
            <span style={{ color: "#bfc7d5" }}>Your vault position (USD):</span>{" "}
            <span style={{ fontWeight: 700, color: "#fff" }}>
              {userAssetsUsd === null ? "-" : userAssetsUsd}
            </span>
          </div>
        </div>
        {txStatus && (
          <div
            style={{
              marginTop: 16,
              color: txStatus.toLowerCase().includes("fail")
                ? "#ff5252"
                : "#4caf50",
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            {txStatus}
          </div>
        )}
        {(approveError || depositError || withdrawError) && (
          <div
            style={{
              color: "#ff5252",
              marginTop: 12,
              fontWeight: 600,
              background: "#2a1a1a",
              borderRadius: 8,
              padding: 12,
              textAlign: "center",
            }}
          >
            {approveError && <div>Approve Error: {approveError.message}</div>}
            {depositError && <div>Deposit Error: {depositError.message}</div>}
            {withdrawError && (
              <div>Withdraw Error: {withdrawError.message}</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
