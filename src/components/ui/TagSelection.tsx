"use client";

import { useId, useState, type ReactNode } from "react";
import { Tag } from "@/components/ui/Tag";
import { cn } from "@/lib/utils";

export interface TagSelectionOption<T extends string | number = string> {
  value: T;
  label: string;
  /** Text color. Falls back to the default outline/solid Tag style when omitted. */
  color?: string;
  /** Background color, used once the option is selected. Falls back to the default style. */
  bgColor?: string;
}

export interface TagSelectionProps<T extends string | number = string> {
  label?: string;
  required?: boolean;
  options: TagSelectionOption<T>[];
  value?: T[];
  defaultValue?: T[];
  onValueChange?: (value: T[]) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  name?: string;
  className?: string;
  tagClassName?: string;
  /** Extra content rendered after the tags, inside the same wrapping row (e.g. an expand toggle). */
  trailing?: ReactNode;
}

/**
 * Multi-select rendered as a row of toggleable {@link Tag}s instead of a dropdown — pick as many
 * options as apply by clicking them directly. Options without a `color`/`bgColor` fall back to
 * the Tag's default styling.
 *
 * @example
 * <TagSelection
 *   label="หมวดหมู่"
 *   required
 *   options={categories.map((c) => ({ value: c.id, label: c.label, color: c.fontColor, bgColor: c.backgroundColor }))}
 *   value={selectedIds}
 *   onValueChange={setSelectedIds}
 * />
 */
const TagSelection = <T extends string | number = string>({
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
  tagClassName,
  trailing,
}: TagSelectionProps<T>) => {
  const [internalValue, setInternalValue] = useState<T[]>(defaultValue ?? []);
  const selected = value ?? internalValue;

  const labelId = useId();
  const errorId = useId();

  const toggle = (option: T) => {
    if (disabled) return;
    const next = selected.includes(option)
      ? selected.filter((v) => v !== option)
      : [...selected, option];
    if (value === undefined) {
      setInternalValue(next);
    }
    onValueChange?.(next);
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span
          id={labelId}
          className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
        >
          {label} {required && <span className="text-error">*</span>}
        </span>
      )}
      <div
        role="group"
        aria-labelledby={label ? labelId : undefined}
        aria-describedby={error && errorMessage ? errorId : undefined}
        className="flex flex-wrap gap-3"
      >
        {options.map((option) => (
          <Tag
            key={option.value}
            type="selectable"
            selected={selected.includes(option.value)}
            color={option.color}
            bgColor={option.bgColor}
            onClick={() => toggle(option.value)}
            className={cn(disabled && "pointer-events-none opacity-50", tagClassName)}
          >
            {option.label}
          </Tag>
        ))}
        {trailing}
      </div>
      {name &&
        selected.map((option) => <input key={option} type="hidden" name={name} value={option} />)}
      {error && errorMessage && (
        <span id={errorId} className="font-ibm-plex text-error text-xs leading-[23px] sm:text-sm">
          {errorMessage}
        </span>
      )}
    </div>
  );
};

export { TagSelection };
