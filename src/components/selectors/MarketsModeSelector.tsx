import React from "react";
import styles from "./MarketsModeSelector.module.css";

interface MarketsModeSelectorProps {
  mode: "supply" | "withdraw" | "borrow" | "repay";
  onModeChange: (mode: "supply" | "withdraw" | "borrow" | "repay") => void;
}

export function MarketsModeSelector({
  mode,
  onModeChange,
}: MarketsModeSelectorProps) {
  const modes = [
    { key: "supply" as const, label: "Supply" },
    { key: "withdraw" as const, label: "Withdraw" },
    { key: "borrow" as const, label: "Borrow" },
    { key: "repay" as const, label: "Repay" },
  ];

  return (
    <div className={styles.modeContainer}>
      {modes.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onModeChange(key)}
          className={`${styles.modeButton} ${
            mode === key ? styles.active : ""
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
