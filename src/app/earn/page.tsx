"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { NetworkStatus } from "../../components/layout/NetworkStatus";
import Navigation from "../../components/layout/Navigation";
import { useVaultsList } from "../../lib/hooks";
import styles from "./earn.module.css";

export default function EarnPage() {
  const { isConnected } = useAccount();
  const { vaults, loading, error } = useVaultsList("whitelisted-desc");

  return (
    <div className="main-container">
      <Navigation />
      <div className="container">
        <h1 className="title">Earn</h1>

        <NetworkStatus />

        <div className="mb-24">
          <p className="subtitle">
            Choose a vault to start earning yield on your assets
          </p>
        </div>

        {loading && (
          <div className={styles.loadingContainer}>Loading vaults...</div>
        )}

        {error && (
          <div className={styles.errorContainer}>
            Error loading vaults: {error}
          </div>
        )}

        {!loading && !error && (
          <div className={styles.vaultsContainer}>
            {vaults.length > 0 ? (
              vaults.map((vault) => (
                <Link
                  key={vault.id}
                  href={`/earn/${vault.id}`}
                  className={styles.vaultCard}
                >
                  <div className={styles.vaultHeader}>
                    <div className={styles.vaultTitle}>
                      <h3 className={styles.vaultName}>{vault.name}</h3>
                      {vault.whitelisted && (
                        <span className={styles.whitelistBadge}>
                          Whitelisted
                        </span>
                      )}
                    </div>
                    <div className={styles.vaultApyContainer}>
                      <span className={styles.vaultNetApy}>
                        {vault.netApy} Net APY
                      </span>
                      {vault.apy !== vault.netApy && (
                        <span className={styles.vaultBaseApy}>
                          {vault.apy} Base
                        </span>
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
                      <span className={styles.vaultStatValue}>
                        {vault.sharePrice}
                      </span>
                    </div>
                    <div className={styles.vaultStat}>
                      <span className={styles.vaultStatLabel}>
                        Total Supply
                      </span>
                      <span className={styles.vaultStatValue}>
                        {vault.totalSupply}
                      </span>
                    </div>
                  </div>

                  {vault.rewards.length > 0 && (
                    <div className={styles.vaultRewards}>
                      <span className={styles.vaultRewardsLabel}>Rewards:</span>
                      {vault.rewards.map((reward, index) => (
                        <span key={index} className={styles.vaultReward}>
                          {reward.asset} {reward.supplyApr}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className={styles.vaultFooter}>
                    <span className={styles.vaultLink}>View Details →</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className={styles.noVaultsContainer}>
                No vaults available at the moment.
              </div>
            )}
          </div>
        )}

        {!isConnected && (
          <div className={styles.warningContainer}>
            Connect your wallet to start earning
          </div>
        )}
      </div>
    </div>
  );
}
