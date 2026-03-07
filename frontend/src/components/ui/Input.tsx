"use client";

import { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export default function Input({ label, error, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className={clsx(
          "border rounded-lg px-3 py-2 text-sm",
          error ? "border-red-500" : "border-gray-300"
        )}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
