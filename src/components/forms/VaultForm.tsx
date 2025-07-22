import React from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import styles from "./VaultForm.module.css";

interface VaultFormProps {
  mode: "deposit" | "withdraw";
  amount: string;
  onAmountChange: (amount: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onApprove?: () => void;
  isConnected: boolean;
  isDepositing: boolean;
  isWithdrawing: boolean;
  isApproving: boolean;
  needsApproval: boolean;
}

export function VaultForm({
  mode,
  amount,
  onAmountChange,
  onSubmit,
  onApprove,
  isConnected,
  isDepositing,
  isWithdrawing,
  isApproving,
  needsApproval,
}: VaultFormProps) {
  return (
    <form onSubmit={onSubmit} className={styles.form}>
      <Input
        type="number"
        min={0}
        step="any"
        placeholder="Amount in USDC"
        value={amount}
        onChange={(e) => onAmountChange(e.target.value)}
        required
      />

      {mode === "deposit" && needsApproval && onApprove && (
        <Button variant="approve" loading={isApproving} onClick={onApprove}>
          Approve USDC
        </Button>
      )}

      <Button
        type="submit"
        variant="primary"
        disabled={
          !isConnected ||
          (mode === "deposit" && (isDepositing || needsApproval)) ||
          (mode === "withdraw" && isWithdrawing)
        }
        loading={mode === "deposit" ? isDepositing : isWithdrawing}
      >
        {mode === "deposit" ? "Deposit" : "Withdraw"}
      </Button>
    </form>
  );
}
