import { useState, useEffect } from "react";
import { formatUnits } from "viem";
import { useReadContract } from "wagmi";
import { CONTRACTS, DECIMALS } from "../constants";
import { ERC20_ABI, REWARDS_ABI } from "../ABIs";

interface RewardsData {
  rewardBalance: string | null;
  rewardToken: string | null;
  rewardTokenSymbol: string | null;
}

export function useRewardsData(address: string | undefined): RewardsData {
  const [rewardBalance, setRewardBalance] = useState<string | null>(null);
  const [rewardToken, setRewardToken] = useState<string | null>(null);
  const [rewardTokenSymbol, setRewardTokenSymbol] = useState<string | null>(
    null
  );

  // Read reward balance
  const { data: userRewardBalance } = useReadContract({
    address: CONTRACTS.REWARDS_DISTRIBUTOR as `0x${string}`,
    abi: REWARDS_ABI,
    functionName: "getUserRewardBalance",
    args: address
      ? [address as `0x${string}`, CONTRACTS.MORPHO_USDC_VAULT as `0x${string}`]
      : undefined,
    query: { enabled: !!address },
  });

  // Read reward token address
  const { data: rewardTokenAddress } = useReadContract({
    address: CONTRACTS.REWARDS_DISTRIBUTOR as `0x${string}`,
    abi: REWARDS_ABI,
    functionName: "getRewardToken",
    args: [CONTRACTS.MORPHO_USDC_VAULT as `0x${string}`],
  });

  // Read reward token symbol
  const { data: rewardTokenSymbolData } = useReadContract({
    address: rewardTokenAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: "symbol",
    query: { enabled: !!rewardTokenAddress },
  });

  // Update reward data when contract data changes
  useEffect(() => {
    if (userRewardBalance !== undefined) {
      const formattedBalance = formatUnits(
        userRewardBalance as bigint,
        DECIMALS.MORPHO
      );
      setRewardBalance(formattedBalance);
    }
    if (rewardTokenAddress && typeof rewardTokenAddress === "string") {
      setRewardToken(rewardTokenAddress);
    }
    if (rewardTokenSymbolData && typeof rewardTokenSymbolData === "string") {
      setRewardTokenSymbol(rewardTokenSymbolData);
    }
  }, [userRewardBalance, rewardTokenAddress, rewardTokenSymbolData]);

  return {
    rewardBalance,
    rewardToken,
    rewardTokenSymbol,
  };
}
