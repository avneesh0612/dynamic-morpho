import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import styles from "./Navigation.module.css";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className={styles.navigation}>
      <div className={styles.navContainer}>
        <Link
          href="/borrow"
          className={`${styles.navLink} ${
            isActive("/borrow") ? styles.active : ""
          }`}
        >
          Borrow
        </Link>
        <Link
          href="/earn"
          className={`${styles.navLink} ${
            isActive("/earn") ? styles.active : ""
          }`}
        >
          Earn
        </Link>
      </div>

      <DynamicWidget />
    </nav>
  );
}
