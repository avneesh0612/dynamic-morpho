import React from "react";
import styles from "./Button.module.css";

interface ButtonProps {
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "approve" | "claim";
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function Button({
  type = "button",
  variant = "primary",
  disabled = false,
  loading = false,
  children,
  onClick,
  className = "",
}: ButtonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case "primary":
        return styles.buttonPrimary;
      case "secondary":
        return styles.buttonSecondary;
      case "approve":
        return styles.buttonApprove;
      case "claim":
        return styles.buttonClaim;
      default:
        return styles.buttonPrimary;
    }
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${styles.button} ${getVariantClass()} ${className}`}
    >
      {loading ? `${children}...` : children}
    </button>
  );
}
