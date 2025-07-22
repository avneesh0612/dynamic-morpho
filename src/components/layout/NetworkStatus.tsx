import React from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { base } from "wagmi/chains";
import styles from "./NetworkStatus.module.css";

export function NetworkStatus() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isOnCorrectNetwork = chainId === base.id;

  if (!isConnected) {
    return null;
  }

  if (isOnCorrectNetwork) {
    return (
      <div className={`${styles.networkStatus} ${styles.networkStatusSuccess}`}>
        <div
          className={`${styles.networkStatusText} ${styles.networkStatusTextSuccess}`}
        >
          ✓ Connected to Base Network
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.networkStatus} ${styles.networkStatusError}`}>
      <div
        className={`${styles.networkStatusText} ${styles.networkStatusTextError}`}
      >
        ⚠️ Wrong Network - Please switch to Base
      </div>
      <button
        onClick={() => switchChain({ chainId: base.id })}
        className={styles.switchButton}
      >
        Switch to Base Network
      </button>
    </div>
  );
}
