import { useState } from "react";
import { useWriteContract } from "wagmi";
import { CONTRACTS } from "../constants";
import { REWARDS_ABI } from "../ABIs";

export function useRewardsOperations(vaultAddress?: string) {
  const [claimTxStatus, setClaimTxStatus] = useState("");

  // Claim rewards
  const {
    writeContract: writeClaimReward,
    isPending: isClaiming,
    error: claimError,
  } = useWriteContract();

  const handleClaimReward = async () => {
    if (!vaultAddress) return;
    
    setClaimTxStatus("");
    try {
      await writeClaimReward({
        address: CONTRACTS.REWARDS_DISTRIBUTOR as `0x${string}`,
        abi: REWARDS_ABI,
        functionName: "claimReward",
        args: [vaultAddress as `0x${string}`],
      });
      setClaimTxStatus("Reward claim transaction sent!");
    } catch (e: unknown) {
      setClaimTxStatus(
        "Claim failed: " +
          (e && typeof e === "object" && "message" in e
            ? (e as { message?: string }).message
            : String(e))
      );
    }
  };

  return {
    claimTxStatus,
    setClaimTxStatus,
    isClaiming,
    claimError,
    handleClaimReward,
  };
}
