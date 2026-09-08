"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

export interface RadioGroupOption<T extends string | number = string> {
  value: T;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps<T extends string | number = string> {
  label?: string;
  required?: boolean;
  options: RadioGroupOption<T>[];
  value?: T | null;
  defaultValue?: T;
  onValueChange?: (value: T) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  name?: string;
  className?: string;
  orientation?: "horizontal" | "vertical";
}

/**
 * Single-select rendered as a row (or column) of native radios with a custom
 * indicator dot — the single-choice counterpart to {@link TagSelection}. Same
 * label / required / error / errorMessage / name / disabled contract; `options`
 * take the same `{ value, label }` shape.
 *
 * @example
 * <RadioGroup
 *   label="ผู้มีสิทธิ์เข้าร่วม"
 *   required
 *   options={[
 *     { value: "CHULA_STUDENT", label: "นิสิตจุฬาฯ" },
 *     { value: "GENERAL_PUBLIC", label: "บุคคลทั่วไป" },
 *   ]}
 *   value={audience}
 *   onValueChange={setAudience}
 * />
 */
export const RadioGroup = <T extends string | number = string>({
  label,
  required,
  options,
  value,
  defaultValue,
  onValueChange,
  disabled,
  error,
  errorMessage,
  name,
  className,
  orientation = "horizontal",
}: RadioGroupProps<T>) => {
  const groupName = useId();
  const errorId = useId();
  const [internalValue, setInternalValue] = useState<T | null>(defaultValue ?? null);
  const selected = value !== undefined ? value : internalValue;

  const select = (next: T) => {
    if (disabled) return;
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <fieldset className={cn("m-0 flex flex-col gap-2 border-0 p-0", className)}>
      {label && (
        <legend className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]">
          {label} {required && <span className="text-error">*</span>}
        </legend>
      )}
      <div
        role="radiogroup"
        aria-describedby={error && errorMessage ? errorId : undefined}
        className={cn(
          "flex gap-8",
          orientation === "vertical" ? "flex-col gap-3" : "h-[26px] items-center"
        )}
      >
        {options.map((option) => {
          const checked = selected === option.value;
          const optionDisabled = disabled || option.disabled;
          return (
            <label
              key={option.value}
              className={cn(
                "font-ibm-plex text-foreground flex cursor-pointer items-center gap-2 text-sm leading-[23px] md:text-base",
                optionDisabled && "cursor-not-allowed opacity-60"
              )}
            >
              <input
                type="radio"
                name={name ?? groupName}
                value={option.value}
                checked={checked}
                disabled={optionDisabled}
                onChange={() => select(option.value)}
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
};
