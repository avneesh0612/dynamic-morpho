import React from "react";
import styles from "./ModeSelector.module.css";

interface ModeSelectorProps {
  mode: "deposit" | "withdraw";
  onModeChange: (mode: "deposit" | "withdraw") => void;
}

export function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  return (
    <div className={styles.modeContainer}>
      <button
        onClick={() => onModeChange("deposit")}
        className={`${styles.modeButton} ${
          mode === "deposit" ? styles.active : ""
        }`}
      >
        Deposit
      </button>
      <button
        onClick={() => onModeChange("withdraw")}
        className={`${styles.modeButton} ${
          mode === "withdraw" ? styles.active : ""
        }`}
      >
        Withdraw
      </button>
    </div>
  );
}
