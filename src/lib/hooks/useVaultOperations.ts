import { useState } from "react";
import { parseUnits } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import { ERC20_ABI, ERC4626_ABI } from "../ABIs";
import { CONTRACTS, DECIMALS } from "../constants";
import { createTxStatusMessage, formatErrorMessage } from "../utils";

export function useVaultOperations(address: string | undefined) {
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // Read USDC balance
  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.USDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read vault share balance
  const { data: vaultBalance } = useReadContract({
    address: CONTRACTS.MORPHO_USDC_VAULT as `0x${string}`,
    abi: ERC4626_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  // Read allowance
  const { data: allowance } = useReadContract({
    address: CONTRACTS.USDC as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, CONTRACTS.MORPHO_USDC_VAULT] : undefined,
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

  const handleApprove = async () => {
    setTxStatus("");
    try {
      await writeApprove({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACTS.MORPHO_USDC_VAULT, parseUnits(amount, DECIMALS.USDC)],
      });
      setTxStatus(createTxStatusMessage("Approval", true));
    } catch (e: unknown) {
      setTxStatus(
        createTxStatusMessage("Approval", false, formatErrorMessage(e))
      );
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus("");
    try {
      await writeDeposit({
        address: CONTRACTS.MORPHO_USDC_VAULT as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: "deposit",
        args: [parseUnits(amount, DECIMALS.USDC), address],
      });
      setTxStatus(createTxStatusMessage("Deposit", true));
    } catch (e: unknown) {
      setTxStatus(
        createTxStatusMessage("Deposit", false, formatErrorMessage(e))
      );
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus("");
    try {
      await writeWithdraw({
        address: CONTRACTS.MORPHO_USDC_VAULT as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: "withdraw",
        args: [parseUnits(amount, DECIMALS.USDC), address, address],
      });
      setTxStatus(createTxStatusMessage("Withdraw", true));
    } catch (e: unknown) {
      setTxStatus(
        createTxStatusMessage("Withdraw", false, formatErrorMessage(e))
      );
    }
  };

  const needsApproval =
    allowance !== undefined &&
    parseUnits(amount || "0", DECIMALS.USDC) > (allowance as bigint);

  return {
    amount,
    setAmount,
    txStatus,
    setTxStatus,
    usdcBalance,
    vaultBalance,
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
