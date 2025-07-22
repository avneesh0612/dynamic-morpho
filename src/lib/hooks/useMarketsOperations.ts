import { useState } from "react";
import { parseUnits } from "viem";
import { useReadContract, useWriteContract } from "wagmi";
import { ERC20_ABI, MORPHO_MARKETS_ABI } from "../ABIs";
import { CONTRACTS, DECIMALS, MARKET_PARAMS } from "../constants";

export function useMarketsOperations(address: string | undefined) {
  const [amount, setAmount] = useState("");
  const [txStatus, setTxStatus] = useState("");

  // Read WETH balance
  const { data: wethBalance } = useReadContract({
    address: MARKET_PARAMS.loanToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  // Read USDC balance for collateral
  const { data: usdcBalance } = useReadContract({
    address: MARKET_PARAMS.collateralToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  // Read allowances
  const { data: wethAllowance } = useReadContract({
    address: MARKET_PARAMS.loanToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address
      ? [address as `0x${string}`, CONTRACTS.MORPHO_MARKETS as `0x${string}`]
      : undefined,
    query: { enabled: !!address },
  });

  const { data: usdcAllowance } = useReadContract({
    address: MARKET_PARAMS.collateralToken as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: address
      ? [address as `0x${string}`, CONTRACTS.MORPHO_MARKETS as `0x${string}`]
      : undefined,
    query: { enabled: !!address },
  });

  // Write contracts
  const {
    writeContract: writeApproveWeth,
    isPending: isApprovingWeth,
    error: approveWethError,
  } = useWriteContract();
  const {
    writeContract: writeApproveUsdc,
    isPending: isApprovingUsdc,
    error: approveUsdcError,
  } = useWriteContract();
  const {
    writeContract: writeSupply,
    isPending: isSupplying,
    error: supplyError,
  } = useWriteContract();
  const {
    writeContract: writeWithdraw,
    isPending: isWithdrawing,
    error: withdrawError,
  } = useWriteContract();
  const {
    writeContract: writeBorrow,
    isPending: isBorrowing,
    error: borrowError,
  } = useWriteContract();
  const {
    writeContract: writeRepay,
    isPending: isRepaying,
    error: repayError,
  } = useWriteContract();

  // Approve functions
  const handleApproveWeth = async () => {
    setTxStatus("");
    try {
      await writeApproveWeth({
        address: MARKET_PARAMS.loanToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          CONTRACTS.MORPHO_MARKETS as `0x${string}`,
          parseUnits(amount, DECIMALS.WETH),
        ],
      });
      setTxStatus("WETH approval transaction sent!");
    } catch (e: unknown) {
      setTxStatus(
        "WETH approval failed: " +
          (e && typeof e === "object" && "message" in e
            ? (e as { message?: string }).message
            : String(e))
      );
    }
  };

  const handleApproveUsdc = async () => {
    setTxStatus("");
    try {
      await writeApproveUsdc({
        address: MARKET_PARAMS.collateralToken as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [
          CONTRACTS.MORPHO_MARKETS as `0x${string}`,
          parseUnits(amount, DECIMALS.USDC),
        ],
      });
      setTxStatus("USDC approval transaction sent!");
    } catch (e: unknown) {
      setTxStatus(
        "USDC approval failed: " +
          (e && typeof e === "object" && "message" in e
            ? (e as { message?: string }).message
            : String(e))
      );
    }
  };

  // Market operations
  const handleSupply = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus("");
    try {
      await writeSupply({
        address: CONTRACTS.MORPHO_MARKETS as `0x${string}`,
        abi: MORPHO_MARKETS_ABI,
        functionName: "supply",
        args: [
          MARKET_PARAMS.collateralToken as `0x${string}`,
          parseUnits(amount, DECIMALS.USDC),
          address as `0x${string}`,
          BigInt(5), // maxIterations
        ],
      });
      setTxStatus("Supply transaction sent!");
    } catch (e: unknown) {
      setTxStatus(
        "Supply failed: " +
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
      await writeWithdraw({
        address: CONTRACTS.MORPHO_MARKETS as `0x${string}`,
        abi: MORPHO_MARKETS_ABI,
        functionName: "withdraw",
        args: [
          MARKET_PARAMS.collateralToken as `0x${string}`,
          parseUnits(amount, DECIMALS.USDC),
          address as `0x${string}`,
          address as `0x${string}`,
        ],
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

  const handleBorrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus("");
    try {
      await writeBorrow({
        address: CONTRACTS.MORPHO_MARKETS as `0x${string}`,
        abi: MORPHO_MARKETS_ABI,
        functionName: "borrow",
        args: [
          MARKET_PARAMS.loanToken as `0x${string}`,
          parseUnits(amount, DECIMALS.WETH),
          address as `0x${string}`,
          BigInt(5), // maxIterations
        ],
      });
      setTxStatus("Borrow transaction sent!");
    } catch (e: unknown) {
      setTxStatus(
        "Borrow failed: " +
          (e && typeof e === "object" && "message" in e
            ? (e as { message?: string }).message
            : String(e))
      );
    }
  };

  const handleRepay = async (e: React.FormEvent) => {
    e.preventDefault();
    setTxStatus("");
    try {
      await writeRepay({
        address: CONTRACTS.MORPHO_MARKETS as `0x${string}`,
        abi: MORPHO_MARKETS_ABI,
        functionName: "repay",
        args: [
          MARKET_PARAMS.loanToken as `0x${string}`,
          parseUnits(amount, DECIMALS.WETH),
          address as `0x${string}`,
        ],
      });
      setTxStatus("Repay transaction sent!");
    } catch (e: unknown) {
      setTxStatus(
        "Repay failed: " +
          (e && typeof e === "object" && "message" in e
            ? (e as { message?: string }).message
            : String(e))
      );
    }
  };

  // Check if approvals are needed
  const needsWethApproval =
    wethAllowance !== undefined &&
    parseUnits(amount || "0", DECIMALS.WETH) > (wethAllowance as bigint);
  const needsUsdcApproval =
    usdcAllowance !== undefined &&
    parseUnits(amount || "0", DECIMALS.USDC) > (usdcAllowance as bigint);

  return {
    amount,
    setAmount,
    txStatus,
    setTxStatus,
    wethBalance,
    usdcBalance,
    wethAllowance,
    usdcAllowance,
    isApprovingWeth,
    isApprovingUsdc,
    isSupplying,
    isWithdrawing,
    isBorrowing,
    isRepaying,
    approveWethError,
    approveUsdcError,
    supplyError,
    withdrawError,
    borrowError,
    repayError,
    handleApproveWeth,
    handleApproveUsdc,
    handleSupply,
    handleWithdraw,
    handleBorrow,
    handleRepay,
    needsWethApproval,
    needsUsdcApproval,
  };
}
