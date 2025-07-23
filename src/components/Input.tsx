import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      className={`px-5 py-5 rounded-2xl border-2 border-white/15 text-lg mb-1 text-foreground bg-gradient-to-br from-white/8 to-white/3 outline-none shadow-lg w-full font-inherit transition-all duration-300 ease-in-out backdrop-blur-md focus:border-blue-600 focus:shadow-xl focus:shadow-blue-600/30 focus:-translate-y-1 placeholder:text-gray-400 placeholder:opacity-60 ${className}`}
      {...props}
    />
  );
}
