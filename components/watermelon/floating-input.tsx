"use client";

import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";

interface FloatingInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  trailing?: ReactNode;
  labelClassName?: string;
}

export function FloatingInput({
  label,
  className = "",
  trailing,
  labelClassName = "bg-raised",
  onChange,
  onBlur,
  onFocus,
  value,
  ...props
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false);
  const hasValue = typeof value === "string" ? value !== "" : false;
  const raised = focused || hasValue;

  return (
    <div className="relative">
      <input
        {...props}
        value={value}
        placeholder=" "
        className={`peer h-12 w-full rounded-full border border-white/15 bg-transparent px-5 text-sm text-white outline-none transition-colors focus:border-white/60 ${trailing ? "pr-12" : ""} ${className}`}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        onChange={onChange}
      />
      <label
        htmlFor={props.id}
        className={`pointer-events-none absolute left-5 ${labelClassName} px-1 text-white/45 transition-all duration-200 ${
          raised ? "-top-2.5 left-4 text-xs text-white/80" : "top-3.5 text-sm"
        }`}
      >
        {label}
      </label>
      {trailing ? (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {trailing}
        </div>
      ) : null}
    </div>
  );
}
