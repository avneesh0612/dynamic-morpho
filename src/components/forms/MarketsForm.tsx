import React from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import styles from "./MarketsForm.module.css";

// Market mode configuration
const MARKET_MODE_CONFIG = {
  supply: {
    placeholder: "Amount in USDC",
    buttonText: "Supply USDC",
    loadingText: "Supplying...",
  },
  withdraw: {
    placeholder: "Amount in USDC",
    buttonText: "Withdraw USDC",
    loadingText: "Withdrawing...",
  },
  borrow: {
    placeholder: "Amount in WETH",
    buttonText: "Borrow WETH",
    loadingText: "Borrowing...",
  },
  repay: {
    placeholder: "Amount in WETH",
    buttonText: "Repay WETH",
    loadingText: "Repaying...",
  },
} as const;

interface MarketsFormProps {
  mode: "supply" | "withdraw" | "borrow" | "repay";
  amount: string;
  onAmountChange: (amount: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onApproveWeth?: () => void;
  onApproveUsdc?: () => void;
  isConnected: boolean;
  isSupplying: boolean;
  isWithdrawing: boolean;
  isBorrowing: boolean;
  isRepaying: boolean;
  isApprovingWeth: boolean;
  isApprovingUsdc: boolean;
  needsWethApproval: boolean;
  needsUsdcApproval: boolean;
}

export function MarketsForm({
  mode,
  amount,
  onAmountChange,
  onSubmit,
  onApproveWeth,
  onApproveUsdc,
  isConnected,
  isSupplying,
  isWithdrawing,
  isBorrowing,
  isRepaying,
  isApprovingWeth,
  isApprovingUsdc,
  needsWethApproval,
  needsUsdcApproval,
}: MarketsFormProps) {
  const config = MARKET_MODE_CONFIG[mode];
  const isPending = isSupplying || isWithdrawing || isBorrowing || isRepaying;

  const getButtonText = () => {
    if (isPending) {
      return config.loadingText;
    }
    return config.buttonText;
  };
  const needsApproval =
    mode === "borrow" || mode === "repay"
      ? needsWethApproval
      : needsUsdcApproval;
  const isApproving =
    mode === "borrow" || mode === "repay" ? isApprovingWeth : isApprovingUsdc;
  const onApprove =
    mode === "borrow" || mode === "repay" ? onApproveWeth : onApproveUsdc;

  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Input
        type="number"
        min={0}
        step="any"
        placeholder={config.placeholder}
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        required
      />

      {needsApproval && onApprove && (
        <Button variant="approve" loading={isApproving} onClick={onApprove}>
          {`Approve ${mode === "borrow" || mode === "repay" ? "WETH" : "USDC"}`}
        </Button>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={!isConnected || isPending || needsApproval}
        loading={isPending}
      >
        {getButtonText()}
      </Button>
    </form>
  );
}
