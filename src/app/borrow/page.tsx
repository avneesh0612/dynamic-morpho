"use client";

import { useMarketsData, useMarketsOperations } from "@/lib/hooks";
import { useState } from "react";
import { useAccount } from "wagmi";
import {
  MarketsBalanceDisplay,
  MarketsForm,
  MarketsModeSelector,
  NetworkStatus,
  StatusDisplay,
} from "../../components";
import Navigation from "../../components/layout/Navigation";
import styles from "./borrow.module.css";

export default function BorrowPage() {
  const { address, isConnected } = useAccount();
  const [marketsMode, setMarketsMode] = useState<
    "supply" | "withdraw" | "borrow" | "repay"
  >("supply");

  // Custom hooks for data and operations
  const marketsData = useMarketsData(address);
  const marketsOperations = useMarketsOperations(address);

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

  return (
    <div className="main-container">
      <Navigation />
      <div className="container">
        <h1 className="title">Borrow</h1>

        <NetworkStatus />

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

        <StatusDisplay
          txStatus={marketsOperations.txStatus}
          approveError={
            marketsOperations.approveWethError ||
            marketsOperations.approveUsdcError
          }
          depositError={marketsOperations.supplyError}
          withdrawError={marketsOperations.withdrawError}
          borrowError={marketsOperations.borrowError}
          repayError={marketsOperations.repayError}
        />
      </div>
    </div>
  );
}
