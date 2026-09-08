"use client";

import { useId } from "react";

import { cn } from "@/lib/utils";

type AudienceValue = "CHULA_STUDENT" | "GENERAL_PUBLIC";

type AudienceRadioFieldProps = {
  label: string;
  required?: boolean;
  value: AudienceValue | null;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  onChange: (value: AudienceValue) => void;
};

const OPTIONS: { value: AudienceValue; label: string }[] = [
  { value: "CHULA_STUDENT", label: "นิสิตจุฬาฯ" },
  { value: "GENERAL_PUBLIC", label: "บุคคลทั่วไป" },
];

export function AudienceRadioField({
  label,
  required,
  value,
  disabled = false,
  error,
  errorMessage,
  onChange,
}: AudienceRadioFieldProps) {
  const name = useId();
  const errorId = useId();

  return (
    <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
      <legend className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]">
        {label} {required && <span className="text-error">*</span>}
      </legend>
      <div
        className="flex h-[26px] items-center gap-8"
        role="radiogroup"
        aria-describedby={error && errorMessage ? errorId : undefined}
      >
        {OPTIONS.map((option) => {
          const checked = value === option.value;
          return (
            <label
              key={option.value}
              className={cn(
                "font-ibm-plex text-foreground flex cursor-pointer items-center gap-2 text-sm leading-[23px] md:text-base",
                disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "peer-focus-visible:ring-primary flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2",
                  checked ? "border-primary" : "border-foreground-secondary",
                  error && !checked && "border-error"
                )}
              >
                <span
                  className={cn(
                    "bg-primary size-2 rounded-full transition-transform",
                    checked ? "scale-100" : "scale-0"
                  )}
                />
              </span>
              {option.label}
            </label>
          );
        })}
      </div>
      {error && errorMessage && (
        <span
          id={errorId}
          role="alert"
          className="font-ibm-plex text-error text-xs leading-[23px] md:text-sm"
        >
          {errorMessage}
        </span>
      )}
    </fieldset>
  );
}
