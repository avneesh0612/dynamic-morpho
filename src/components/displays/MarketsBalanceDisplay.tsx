import React from "react";
import { formatUnits } from "viem";
import { DECIMALS } from "@/lib/constants";
import styles from "./MarketsBalanceDisplay.module.css";

interface MarketsBalanceDisplayProps {
  wethBalance: unknown;
  usdcBalance: unknown;
  borrowed: string | null;
  supplied: string | null;
  borrowedUsd: string | null;
  suppliedUsd: string | null;
  collateral: string | null;
  collateralUsd: string | null;
  healthFactor: string | null;
}

export function MarketsBalanceDisplay({
  wethBalance,
  usdcBalance,
  borrowed,
  supplied,
  borrowedUsd,
  suppliedUsd,
  collateral,
  collateralUsd,
  healthFactor,
}: MarketsBalanceDisplayProps) {
  // Format balance values
  const formattedWethBalance = wethBalance
    ? formatUnits(wethBalance as bigint, DECIMALS.WETH)
    : "-";
  const formattedUsdcBalance = usdcBalance
    ? formatUnits(usdcBalance as bigint, DECIMALS.USDC)
    : "-";

  const getHealthFactorClass = (factor: string) => {
    const value = parseFloat(factor);
    if (value < 1.1) return styles.healthFactorDanger;
    if (value < 1.5) return styles.healthFactorWarning;
    return styles.healthFactorGood;
  };

  return (
    <div className={styles.balanceRow}>
      <div>
        <span className={styles.balanceLabel}>Your WETH balance:</span>{" "}
        <span className={styles.balanceValue}>{formattedWethBalance}</span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Your USDC balance:</span>{" "}
        <span className={styles.balanceValue}>{formattedUsdcBalance}</span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Supplied assets (USDC):</span>{" "}
        <span className={styles.balanceValue}>
          {supplied === null ? "-" : supplied}
        </span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Supplied assets (USD):</span>{" "}
        <span className={styles.balanceValue}>
          {suppliedUsd === null ? "-" : suppliedUsd}
        </span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Collateral (USDC):</span>{" "}
        <span className={styles.balanceValue}>
          {collateral === null ? "-" : collateral}
        </span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Collateral (USD):</span>{" "}
        <span className={styles.balanceValue}>
          {collateralUsd === null ? "-" : collateralUsd}
        </span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Borrowed (WETH):</span>{" "}
        <span className={styles.balanceValue}>
          {borrowed === null ? "-" : borrowed}
        </span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Borrowed (USD):</span>{" "}
        <span className={styles.balanceValue}>
          {borrowedUsd === null ? "-" : borrowedUsd}
        </span>
      </div>

      {healthFactor && (
        <div>
          <span className={styles.balanceLabel}>Health Factor:</span>{" "}
          <span
            className={`${styles.healthFactor} ${getHealthFactorClass(
              healthFactor
            )}`}
          >
            {healthFactor}
          </span>
        </div>
      )}
    </div>
  );
}
