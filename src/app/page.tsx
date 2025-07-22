"use client";

import Navigation from "../components/layout/Navigation";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Main() {
  const router = useRouter();

  useEffect(() => {
    router.push("/earn");
  }, [router]);

  return (
    <div className="main-container">
      <Navigation />
      <div className="text-center" style={{ color: "var(--text-muted)" }}>
        Redirecting to Earn page...
      </div>
    </div>
  );
}
