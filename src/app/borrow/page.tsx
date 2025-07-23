"use client";

import { useMarketsData, useMarketsOperations } from "@/lib/hooks";
import { useState } from "react";
import { useAccount } from "wagmi";
import {
  MarketsBalanceDisplay,
  MarketsForm,
  MarketsModeSelector,
} from "../../components";

export default function BorrowPage() {
  const { address, isConnected } = useAccount();
  const [marketsMode, setMarketsMode] = useState<
    "supply" | "withdraw" | "borrow" | "repay"
  >("supply");

  // Custom hooks for data and operations
  const marketsData = useMarketsData(address);
  const marketsOperations = useMarketsOperations(address, 18); // WETH decimals

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <h1 className="text-5xl font-extrabold text-center mb-6 bg-gradient-to-br from-white to-blue-400 bg-clip-text text-transparent">
        Borrow
      </h1>

      <div className="mb-8">
        <h3 className="text-white font-bold text-center mb-2">
          WETH/Collateral Market
        </h3>
      </div>

      <MarketsModeSelector mode={marketsMode} onModeChange={setMarketsMode} />

      <MarketsForm
        mode={marketsMode}
        amount={marketsOperations.amount}
        onAmountChange={marketsOperations.setAmount}
        onSubmit={getMarketsSubmitHandler()}
        onApproveLoanToken={marketsOperations.handleApproveLoanToken}
        onApproveCollateral={marketsOperations.handleApproveCollateral}
        isConnected={isConnected}
        isSupplying={marketsOperations.isSupplying}
        isWithdrawing={marketsOperations.isWithdrawing}
        isBorrowing={marketsOperations.isBorrowing}
        isRepaying={marketsOperations.isRepaying}
        isApprovingLoanToken={marketsOperations.isApprovingLoanToken}
        isApprovingCollateral={marketsOperations.isApprovingCollateral}
        needsLoanTokenApproval={marketsOperations.needsLoanTokenApproval}
        needsCollateralApproval={marketsOperations.needsCollateralApproval}
        loanTokenSymbol="WETH"
        collateralSymbol="Collateral"
      />

      <MarketsBalanceDisplay
        loanTokenBalance={marketsOperations.loanTokenBalance}
        collateralBalance={marketsOperations.collateralBalance}
        borrowed={marketsData.borrowed}
        supplied={marketsData.supplied}
        borrowedUsd={marketsData.borrowedUsd}
        suppliedUsd={marketsData.suppliedUsd}
        collateral={marketsData.collateral}
        collateralUsd={marketsData.collateralUsd}
        healthFactor={marketsData.healthFactor}
        loanTokenSymbol="WETH"
        collateralSymbol="Collateral"
        loanTokenDecimals={18}
        collateralDecimals={6}
      />


    </div>
  );
}
