import { useState } from "react";
import { parseUnits } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import { ERC20_ABI, ERC4626_ABI } from "../ABIs";
import { createTxStatusMessage, formatErrorMessage } from "../utils";

interface VaultInfo {
  address: string;
  asset: {
    address: string;
    symbol: string;
    decimals: number;
  };
}

export function useVaultOperations(
  address: string | undefined,
  vaultInfo: VaultInfo | null
) {
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // Read asset balance
  const { data: assetBalance } = useReadContract({
    address: vaultInfo?.asset.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!vaultInfo?.asset.address },
  });

  // Read vault share balance
  const { data: vaultBalance } = useReadContract({
    address: vaultInfo?.address as `0x${string}`,
    abi: ERC4626_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!vaultInfo?.address },
  });

  // Read user's deposited assets (convert shares to assets)
  const { data: depositedAssets } = useReadContract({
    address: vaultInfo?.address as `0x${string}`,
    abi: ERC4626_ABI,
    functionName: "convertToAssets",
    args: vaultBalance ? [vaultBalance] : undefined,
    query: { enabled: !!vaultInfo?.address && !!vaultBalance },
  });

  // Read allowance
  const { data: allowance } = useReadContract({
    address: vaultInfo?.asset.address as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args:
      address && vaultInfo?.asset.address && vaultInfo?.address
        ? [address, vaultInfo.address]
        : undefined,
    query: {
      enabled: !!address && !!vaultInfo?.asset.address && !!vaultInfo?.address,
    },
  });

  // Approve asset
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

  const handleApprove = async () => {
    if (!vaultInfo?.asset.address || !vaultInfo?.address) return;

    setTxStatus("");
    try {
      await writeApprove({
        address: vaultInfo.asset.address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [vaultInfo.address, parseUnits(amount, vaultInfo.asset.decimals)],
      });
      setTxStatus(createTxStatusMessage("Approval", true));
    } catch (e: unknown) {
      setTxStatus(
        createTxStatusMessage("Approval", false, formatErrorMessage(e))
      );
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    if (!vaultInfo?.address || !address) return;

    e.preventDefault();
    setTxStatus("");
    try {
      await writeDeposit({
        address: vaultInfo.address as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: "deposit",
        args: [parseUnits(amount, vaultInfo.asset.decimals), address],
      });
      setTxStatus(createTxStatusMessage("Deposit", true));
    } catch (e: unknown) {
      setTxStatus(
        createTxStatusMessage("Deposit", false, formatErrorMessage(e))
      );
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    if (!vaultInfo?.address || !address) return;

    e.preventDefault();
    setTxStatus("");
    try {
      await writeWithdraw({
        address: vaultInfo.address as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: "withdraw",
        args: [parseUnits(amount, vaultInfo.asset.decimals), address, address],
      });
      setTxStatus(createTxStatusMessage("Withdraw", true));
    } catch (e: unknown) {
      setTxStatus(
        createTxStatusMessage("Withdraw", false, formatErrorMessage(e))
      );
    }
  };

  const needsApproval =
    (allowance !== undefined &&
      vaultInfo?.asset.decimals &&
      parseUnits(amount || "0", vaultInfo.asset.decimals) >
        (allowance as bigint)) ||
    false;

  return {
    amount,
    setAmount,
    txStatus,
    setTxStatus,
    assetBalance,
    vaultBalance,
    depositedAssets,
    allowance,
    isApproving,
    isDepositing,
    isWithdrawing,
    approveError,
    depositError,
    withdrawError,
    handleApprove,
    handleDeposit,
    handleWithdraw,
    needsApproval,
  };
}
