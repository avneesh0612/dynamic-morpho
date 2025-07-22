import React from "react";
import styles from "./StatusDisplay.module.css";

interface StatusDisplayProps {
  txStatus: string;
  approveError?: Error | null;
  depositError?: Error | null;
  withdrawError?: Error | null;
  claimError?: Error | null;
  borrowError?: Error | null;
  repayError?: Error | null;
}

export function StatusDisplay({
  txStatus,
  approveError,
  depositError,
  withdrawError,
  claimError,
  borrowError,
  repayError,
}: StatusDisplayProps) {
  return (
    <>
      {txStatus && (
        <div
          className={`${styles.statusMessage} ${
            txStatus.toLowerCase().includes("fail")
              ? styles.statusMessageError
              : styles.statusMessageSuccess
          }`}
        >
          {txStatus}
        </div>
      )}

      {(approveError ||
        depositError ||
        withdrawError ||
        claimError ||
        borrowError ||
        repayError) && (
        <div className={styles.errorContainer}>
          {approveError && <div>Approve Error: {approveError.message}</div>}
          {depositError && <div>Deposit Error: {depositError.message}</div>}
          {withdrawError && <div>Withdraw Error: {withdrawError.message}</div>}
          {claimError && <div>Claim Error: {claimError.message}</div>}
          {borrowError && <div>Borrow Error: {borrowError.message}</div>}
          {repayError && <div>Repay Error: {repayError.message}</div>}
        </div>
      )}
    </>
  );
}
