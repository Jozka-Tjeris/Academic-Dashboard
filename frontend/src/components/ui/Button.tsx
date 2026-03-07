"use client";

import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "danger";
  loading?: boolean;
}

export default function Button({
  children,
  loading,
  variant = "primary",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        "px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50",
        {
          "bg-blue-600 text-white hover:bg-blue-700": variant === "primary",
          "bg-red-600 text-white hover:bg-red-700": variant === "danger",
        },
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
