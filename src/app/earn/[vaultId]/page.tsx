"use client";

import {
  useRewardsData,
  useRewardsOperations,
  useVaultData,
  useVaultDetail,
  useVaultOperations,
} from "@/lib/hooks";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAccount } from "wagmi";
import {
  BalanceDisplay,
  ModeSelector,
  NetworkStatus,
  StatusDisplay,
  VaultForm,
} from "../../../components";
import Navigation from "../../../components/layout/Navigation";
import { Button } from "../../../components/ui/Button";
import styles from "./vault-detail.module.css";

export default function VaultDetailPage() {
  const { vaultId } = useParams();
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const [vaultMode, setVaultMode] = useState<"deposit" | "withdraw">("deposit");

  // Get vault data from API
  const {
    vault,
    loading: vaultLoading,
    error: vaultError,
  } = useVaultDetail(vaultId as string);

  // Custom hooks for data and operations
  const vaultData = useVaultData(address);
  const rewardsData = useRewardsData(address);
  const vaultOperations = useVaultOperations(address);
  const rewardsOperations = useRewardsOperations();

  // Combine transaction statuses
  const txStatus = vaultOperations.txStatus || rewardsOperations.claimTxStatus;

  if (vaultLoading) {
    return (
      <div className="main-container">
        <Navigation />
        <div className="container">
          <div className="mb-24">
            <button
              onClick={() => router.push("/earn")}
              className={styles.backButton}
            >
              ← Back to Vaults
            </button>
          </div>
          <div className={styles.loadingContainer}>
            Loading vault details...
          </div>
        </div>
      </div>
    );
  }

  if (vaultError || !vault) {
    return (
      <div className="main-container">
        <Navigation />
        <div className="container">
          <div className="mb-24">
            <button
              onClick={() => router.push("/earn")}
              className={styles.backButton}
            >
              ← Back to Vaults
            </button>
          </div>
          <h1 className="title">Vault Not Found</h1>
          <p className="subtitle">
            {vaultError || "The requested vault could not be found."}
          </p>
          <Button
            variant="primary"
            onClick={() => router.push("/earn")}
            className="mt-16"
          >
            Back to Vaults
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container">
      <Navigation />
      <div className="container">
        <div className="mb-24">
          <button
            onClick={() => router.push("/earn")}
            className={styles.backButton}
          >
            ← Back to Vaults
          </button>

          <div className={styles.vaultTitleContainer}>
            <h1 className="title">{vault.name}</h1>
            {vault.whitelisted && (
              <span className={styles.whitelistBadge}>Whitelisted</span>
            )}
          </div>
        </div>

        <NetworkStatus />

        <div className={styles.vaultInfo}>
          <div className={styles.vaultHeader}>
            <div className={styles.vaultSymbolContainer}>
              <h3 className={styles.vaultSymbol}>{vault.symbol}</h3>
              <span className={styles.vaultAsset}>Asset: {vault.asset}</span>
            </div>
            <div className={styles.vaultApyContainer}>
              <span className={styles.vaultNetApy}>{vault.netApy} Net APY</span>
              {vault.apy !== vault.netApy && (
                <span className={styles.vaultBaseApy}>{vault.apy} Base</span>
              )}
            </div>
          </div>

          <p className={styles.vaultDescription}>{vault.description}</p>

          <div className={styles.vaultStats}>
            <div className={styles.vaultStat}>
              <span className={styles.vaultStatLabel}>TVL</span>
              <span className={styles.vaultStatValue}>{vault.tvl}</span>
            </div>
            <div className={styles.vaultStat}>
              <span className={styles.vaultStatLabel}>Share Price</span>
              <span className={styles.vaultStatValue}>{vault.sharePrice}</span>
            </div>
            <div className={styles.vaultStat}>
              <span className={styles.vaultStatLabel}>Total Supply</span>
              <span className={styles.vaultStatValue}>{vault.totalSupply}</span>
            </div>
            <div className={styles.vaultStat}>
              <span className={styles.vaultStatLabel}>Performance Fee</span>
              <span className={styles.vaultStatValue}>{vault.fee}</span>
            </div>
            <div className={styles.vaultStat}>
              <span className={styles.vaultStatLabel}>Timelock</span>
              <span className={styles.vaultStatValue}>{vault.timelock}</span>
            </div>
            <div className={styles.vaultStat}>
              <span className={styles.vaultStatLabel}>Created</span>
              <span className={styles.vaultStatValue}>
                {vault.creationTimestamp}
              </span>
            </div>
          </div>

          {vault.rewards.length > 0 && (
            <div className={styles.vaultRewards}>
              <span className={styles.vaultRewardsLabel}>
                Available Rewards:
              </span>
              {vault.rewards.map((reward, index) => (
                <span key={index} className={styles.vaultReward}>
                  {reward.asset} {reward.supplyApr}
                </span>
              ))}
            </div>
          )}

          <div className={styles.vaultGovernance}>
            <div className={styles.governanceItem}>
              <span className={styles.governanceLabel}>Owner:</span>
              <span className={styles.governanceValue}>{vault.owner}</span>
            </div>
            <div className={styles.governanceItem}>
              <span className={styles.governanceLabel}>Curator:</span>
              <span className={styles.governanceValue}>{vault.curator}</span>
            </div>
            <div className={styles.governanceItem}>
              <span className={styles.governanceLabel}>Guardian:</span>
              <span className={styles.governanceValue}>{vault.guardian}</span>
            </div>
            <div className={styles.governanceItem}>
              <span className={styles.governanceLabel}>Fee Recipient:</span>
              <span className={styles.governanceValue}>
                {vault.feeRecipient}
              </span>
            </div>
          </div>
        </div>

        <ModeSelector mode={vaultMode} onModeChange={setVaultMode} />

        <VaultForm
          mode={vaultMode}
          amount={vaultOperations.amount}
          onAmountChange={vaultOperations.setAmount}
          onSubmit={
            vaultMode === "deposit"
              ? vaultOperations.handleDeposit
              : vaultOperations.handleWithdraw
          }
          onApprove={vaultOperations.handleApprove}
          isConnected={isConnected}
          isDepositing={vaultOperations.isDepositing}
          isWithdrawing={vaultOperations.isWithdrawing}
          isApproving={vaultOperations.isApproving}
          needsApproval={vaultOperations.needsApproval}
        />

        <BalanceDisplay
          usdcBalance={vaultOperations.usdcBalance}
          vaultBalance={vaultOperations.vaultBalance}
          userAssets={vaultData.userAssets}
          userAssetsUsd={vaultData.userAssetsUsd}
          rewardBalance={rewardsData.rewardBalance}
          rewardTokenSymbol={rewardsData.rewardTokenSymbol}
          onClaimReward={rewardsOperations.handleClaimReward}
          isClaiming={rewardsOperations.isClaiming}
        />

        <StatusDisplay
          txStatus={txStatus}
          approveError={vaultOperations.approveError}
          depositError={vaultOperations.depositError}
          withdrawError={vaultOperations.withdrawError}
          claimError={rewardsOperations.claimError}
        />
      </div>
    </div>
  );
}
