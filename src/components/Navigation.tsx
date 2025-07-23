"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-b border-gray-700/50 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="Morpho"
                width={120}
                height={24}
                className="h-6 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              href="/borrow"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/borrow")
                  ? "text-blue-400 bg-blue-400/10 border border-blue-400/20"
                  : "text-gray-300 hover:text-blue-400 hover:bg-gray-700/50"
              }`}
            >
              Borrow
            </Link>
            <Link
              href="/earn"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive("/earn")
                  ? "text-blue-400 bg-blue-400/10 border border-blue-400/20"
                  : "text-gray-300 hover:text-blue-400 hover:bg-gray-700/50"
              }`}
            >
              Earn
            </Link>
          </div>

          {/* Connect Wallet */}
          <div className="flex items-center">
            <DynamicWidget />
          </div>
        </div>
      </div>
    </nav>
  );
}
