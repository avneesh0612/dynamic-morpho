"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Main() {
  const router = useRouter();

  useEffect(() => {
    router.push("/earn");
  }, [router]);

  return (
    <div className="text-center text-gray-400">Redirecting to Earn page...</div>
  );
}
