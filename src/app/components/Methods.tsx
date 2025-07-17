"use client";
import { useState, useEffect } from "react";
import {
  useDynamicContext,
  useIsLoggedIn,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { isEthereumWallet } from "@dynamic-labs/ethereum";

import "./Methods.css";

interface DynamicMethodsProps {
  isDarkMode: boolean;
}

export default function DynamicMethods({ isDarkMode }: DynamicMethodsProps) {
  const isLoggedIn = useIsLoggedIn();
  const { sdkHasLoaded, primaryWallet, user } = useDynamicContext();
  const userWallets = useUserWallets();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState("");
  const [error, setError] = useState<string | null>(null);

  const safeStringify = (obj: unknown): string => {
    const seen = new WeakSet();
    return JSON.stringify(
      obj,
      (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) {
            return "[Circular]";
          }
          seen.add(value);
        }
        return value;
      },
      2
    );
  };

  useEffect(() => {
    if (sdkHasLoaded && isLoggedIn && primaryWallet) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [sdkHasLoaded, isLoggedIn, primaryWallet]);

  function clearResult() {
    setResult("");
    setError(null);
  }

  function showUser() {
    try {
      setResult(safeStringify(user));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to stringify user data"
      );
    }
  }

  function showUserWallets() {
    try {
      setResult(safeStringify(userWallets));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to stringify wallet data"
      );
    }
  }

  async function fetchEthereumPublicClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      const result = await primaryWallet.getPublicClient();
      setResult(safeStringify(result));
    } catch (error) {
      setResult(
        safeStringify({
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        })
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEthereumWalletClient() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      const result = await primaryWallet.getWalletClient();
      setResult(safeStringify(result));
    } catch (error) {
      setResult(
        safeStringify({
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        })
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEthereumMessage() {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) return;
    try {
      setIsLoading(true);
      const result = await primaryWallet.signMessage("Hello World");
      setResult(safeStringify(result));
    } catch (error) {
      setResult(
        safeStringify({
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        })
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {!isLoading && (
        <div
          className="dynamic-methods"
          data-theme={isDarkMode ? "dark" : "light"}
        >
          <div className="methods-container">
            <button className="btn btn-primary" onClick={showUser}>
              Fetch User
            </button>
            <button className="btn btn-primary" onClick={showUserWallets}>
              Fetch User Wallets
            </button>

            {primaryWallet && isEthereumWallet(primaryWallet) && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={fetchEthereumPublicClient}
                >
                  Fetch PublicClient
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={fetchEthereumWalletClient}
                >
                  Fetch WalletClient
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={fetchEthereumMessage}
                >
                  Fetch Message
                </button>
              </>
            )}
          </div>
          {(result || error) && (
            <div className="results-container">
              {error ? (
                <pre className="results-text error">{error}</pre>
              ) : (
                <pre className="results-text">{result}</pre>
              )}
            </div>
          )}
          {(result || error) && (
            <div className="clear-container">
              <button className="btn btn-primary" onClick={clearResult}>
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
