import React from "react";
import { formatUnits } from "viem";
import { DECIMALS } from "@/lib/constants";
import { Button } from "../ui/Button";
import styles from "./BalanceDisplay.module.css";

interface BalanceDisplayProps {
  usdcBalance: unknown;
  vaultBalance: unknown;
  userAssets: string | null;
  userAssetsUsd: string | null;
  rewardBalance: string | null;
  rewardTokenSymbol: string | null;
  onClaimReward?: () => void;
  isClaiming?: boolean;
}

export function BalanceDisplay({
  usdcBalance,
  vaultBalance,
  userAssets,
  userAssetsUsd,
  rewardBalance,
  rewardTokenSymbol,
  onClaimReward,
  isClaiming = false,
}: BalanceDisplayProps) {
  return (
    <div className={styles.balanceRow}>
      <div>
        <span className={styles.balanceLabel}>Your USDC balance:</span>{" "}
        <span className={styles.balanceValue}>
          {usdcBalance
            ? formatUnits(usdcBalance as bigint, DECIMALS.USDC)
            : "-"}
        </span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Your vault shares:</span>{" "}
        <span className={styles.balanceValue}>
          {vaultBalance
            ? formatUnits(vaultBalance as bigint, DECIMALS.USDC)
            : "-"}
        </span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Your vault position (USDC):</span>{" "}
        <span className={styles.balanceValue}>
          {userAssets === null ? "-" : userAssets}
        </span>
      </div>

      <div>
        <span className={styles.balanceLabel}>Your vault position (USD):</span>{" "}
        <span className={styles.balanceValue}>
          {userAssetsUsd === null ? "-" : userAssetsUsd}
        </span>
      </div>

      <div>
        <span className={styles.balanceLabel}>
          {rewardTokenSymbol || "MORPHO"} rewards:
        </span>{" "}
        <span
          className={
            rewardBalance && parseFloat(rewardBalance) > 0
              ? styles.rewardValue
              : styles.rewardValueInactive
          }
        >
          {rewardBalance
            ? parseFloat(rewardBalance).toLocaleString(undefined, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })
            : "0.0000"}
        </span>
      </div>

      {rewardBalance && parseFloat(rewardBalance) > 0 && onClaimReward && (
        <Button variant="claim" onClick={onClaimReward} disabled={isClaiming}>
          {isClaiming
            ? "Claiming..."
            : `Claim ${rewardTokenSymbol || "MORPHO"} Rewards`}
        </Button>
      )}
    </div>
  );
}
