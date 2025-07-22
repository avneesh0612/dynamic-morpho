import React, { useState } from "react";
import { useAccount } from "wagmi";
import {
  useVaultData,
  useRewardsData,
  useVaultOperations,
  useRewardsOperations,
  useMarketsData,
  useMarketsOperations,
} from "@/lib/hooks";
import {
  ModeSelector,
  VaultForm,
  BalanceDisplay,
  StatusDisplay,
  MarketsModeSelector,
  MarketsForm,
  MarketsBalanceDisplay,
  NetworkStatus,
} from "../index";
import styles from "./morpho.module.css";

type TabType = "vault" | "markets";

export default function MorphoEarnPage() {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>("vault");
  const [vaultMode, setVaultMode] = useState<"deposit" | "withdraw">("deposit");
  const [marketsMode, setMarketsMode] = useState<
    "supply" | "withdraw" | "borrow" | "repay"
  >("supply");

  // Custom hooks for data and operations
  const vaultData = useVaultData(address);
  const rewardsData = useRewardsData(address);
  const vaultOperations = useVaultOperations(address);
  const rewardsOperations = useRewardsOperations();
  const marketsData = useMarketsData(address);
  const marketsOperations = useMarketsOperations(address);

  // Combine transaction statuses
  const txStatus =
    vaultOperations.txStatus ||
    rewardsOperations.claimTxStatus ||
    marketsOperations.txStatus;

  const getMarketsSubmitHandler = () => {
    switch (marketsMode) {
      case "supply":
        return marketsOperations.handleSupply;
      case "withdraw":
        return marketsOperations.handleWithdraw;
      case "borrow":
        return marketsOperations.handleBorrow;
      case "repay":
        return marketsOperations.handleRepay;
      default:
        return marketsOperations.handleSupply;
    }
  };

  const renderTabButton = (tab: TabType, label: string) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`tab-button ${activeTab === tab ? "active" : ""}`}
    >
      {label}
    </button>
  );

  const renderVaultTab = () => (
    <>
      {vaultData.vaultName && (
        <div className="mb-8">
          <h3 className={styles.vaultName}>
            {vaultData.vaultName} ({vaultData.vaultSymbol})
          </h3>
        </div>
      )}

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
    </>
  );

  const renderMarketsTab = () => (
    <>
      <div className="mb-8">
        <h3 className={styles.marketTitle}>WETH/USDC Market</h3>
      </div>

      <MarketsModeSelector mode={marketsMode} onModeChange={setMarketsMode} />

      <MarketsForm
        mode={marketsMode}
        amount={marketsOperations.amount}
        onAmountChange={marketsOperations.setAmount}
        onSubmit={getMarketsSubmitHandler()}
        onApproveWeth={marketsOperations.handleApproveWeth}
        onApproveUsdc={marketsOperations.handleApproveUsdc}
        isConnected={isConnected}
        isSupplying={marketsOperations.isSupplying}
        isWithdrawing={marketsOperations.isWithdrawing}
        isBorrowing={marketsOperations.isBorrowing}
        isRepaying={marketsOperations.isRepaying}
        isApprovingWeth={marketsOperations.isApprovingWeth}
        isApprovingUsdc={marketsOperations.isApprovingUsdc}
        needsWethApproval={marketsOperations.needsWethApproval}
        needsUsdcApproval={marketsOperations.needsUsdcApproval}
      />

      <MarketsBalanceDisplay
        wethBalance={marketsOperations.wethBalance}
        usdcBalance={marketsOperations.usdcBalance}
        borrowed={marketsData.borrowed}
        supplied={marketsData.supplied}
        borrowedUsd={marketsData.borrowedUsd}
        suppliedUsd={marketsData.suppliedUsd}
        collateral={marketsData.collateral}
        collateralUsd={marketsData.collateralUsd}
        healthFactor={marketsData.healthFactor}
      />
    </>
  );

  return (
    <div className="container">
      <h1 className="title">Morpho x Dynamic</h1>

      <NetworkStatus />

      <div className="tab-container">
        {renderTabButton("vault", "Vault (Earn)")}
        {renderTabButton("markets", "Markets (Borrow)")}
      </div>

      <div>
        {activeTab === "vault" && renderVaultTab()}
        {activeTab === "markets" && renderMarketsTab()}

        <StatusDisplay
          txStatus={txStatus}
          approveError={
            vaultOperations.approveError ||
            marketsOperations.approveWethError ||
            marketsOperations.approveUsdcError
          }
          depositError={
            vaultOperations.depositError || marketsOperations.supplyError
          }
          withdrawError={
            vaultOperations.withdrawError || marketsOperations.withdrawError
          }
          claimError={rewardsOperations.claimError}
          borrowError={marketsOperations.borrowError}
          repayError={marketsOperations.repayError}
        />
      </div>
    </div>
  );
}
