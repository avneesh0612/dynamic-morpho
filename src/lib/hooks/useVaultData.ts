import { useState, useEffect } from "react";
import { CONTRACTS, NETWORK, API } from "../constants";

interface VaultPositionItem {
  vault?: { address?: string; name?: string; symbol?: string };
  state?: { assets?: number; assetsUsd?: number };
}

interface VaultData {
  userAssets: string | null;
  userAssetsUsd: string | null;
  vaultName: string | null;
  vaultSymbol: string | null;
}

export function useVaultData(address: string | undefined): VaultData {
  const [userAssets, setUserAssets] = useState<string | null>(null);
  const [userAssetsUsd, setUserAssetsUsd] = useState<string | null>(null);
  const [vaultName, setVaultName] = useState<string | null>(null);
  const [vaultSymbol, setVaultSymbol] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUserPosition() {
      if (!address) return;

      try {
        const res = await fetch(API.MORPHO_GRAPHQL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query GetAllUserPositions($chainId: Int!, $userAddress: String!) {
              vaultPositions(where: {chainId_in: [$chainId], shares_gte: 0, userAddress_in: [$userAddress]}) {
                items {
                  id
                  state {
                    shares
                    assets
                    assetsUsd
                    id
                    pnl
                    pnlUsd
                    roe
                    roeUsd
                    shares
                    timestamp
                  }
                  user { id }
                  vault { id address name symbol }
                }
              }
            }`,
            variables: {
              chainId: NETWORK.CHAIN_ID,
              userAddress: address,
            },
          }),
        });

        const json = await res.json();
        const items: VaultPositionItem[] | undefined =
          json?.data?.vaultPositions?.items;

        const vaultItem = items?.find(
          (item) =>
            item.vault?.address?.toLowerCase() ===
            CONTRACTS.MORPHO_USDC_VAULT.toLowerCase()
        );

        if (vaultItem && vaultItem.state) {
          // assets is in base units (e.g., 1000336 for 1.000336 USDC)
          const assets = vaultItem.state.assets;
          let formattedAssets = null;
          if (typeof assets === "number" && !isNaN(assets)) {
            formattedAssets = (assets / 1e6).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          setUserAssets(formattedAssets);
          setUserAssetsUsd(
            typeof vaultItem.state.assetsUsd === "number"
              ? `$${vaultItem.state.assetsUsd.toLocaleString(undefined, {
                  minimumFractionDigits: 6,
                  maximumFractionDigits: 6,
                })}`
              : null
          );
          setVaultName(vaultItem.vault?.name ?? null);
          setVaultSymbol(vaultItem.vault?.symbol ?? null);
        } else {
          setUserAssets(null);
          setUserAssetsUsd(null);
          setVaultName(null);
          setVaultSymbol(null);
        }
      } catch {
        setUserAssets(null);
        setUserAssetsUsd(null);
        setVaultName(null);
        setVaultSymbol(null);
      }
    }

    fetchUserPosition();
  }, [address]);

  return {
    userAssets,
    userAssetsUsd,
    vaultName,
    vaultSymbol,
  };
}
