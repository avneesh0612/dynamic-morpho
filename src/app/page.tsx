"use client";

import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import MorphoEarnPage from "./components/morpho";

export default function Main() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#18181b",
        flexDirection: "column",
      }}
    >
      <DynamicWidget />
      <MorphoEarnPage />
    </div>
  );
}
