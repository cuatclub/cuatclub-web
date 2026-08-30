"use client";

import { Input } from "@/components";

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
};

export function ColorField({ label, value, onChange, onBlur, error }: ColorFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="font-ibm-plex text-foreground text-sm font-medium md:text-base">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={HEX_COLOR_REGEX.test(value) ? value : "#000000"}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-label={`${label} (color picker)`}
          className="border-border h-10 w-12 shrink-0 cursor-pointer rounded-lg border bg-white p-1"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder="#RRGGBB"
          error={!!error}
          errorMessage={error}
          wrapperClassName="flex-1"
        />
      </div>
    </div>
  );
}
