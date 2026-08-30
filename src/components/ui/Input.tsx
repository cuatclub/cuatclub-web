"use client";

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      required,
      error,
      errorMessage,
      className,
      wrapperClassName,
      id,
      disabled,
      "aria-invalid": _ariaInvalid,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = useId();
    const describedByIds = [error && errorMessage ? errorId : undefined, ariaDescribedBy]
      .filter(Boolean)
      .join(" ");

    return (
      <div className={cn("flex flex-col gap-1", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
          >
            {label} {required && <span className="text-error">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          required={required}
          aria-required={required}
          aria-invalid={error}
          aria-describedby={describedByIds || undefined}
          className={cn(
            "border-border font-ibm-plex text-foreground placeholder:text-placeholder flex h-10 w-full items-center rounded-lg border bg-white px-3 text-sm leading-[23px] transition-colors outline-none md:text-base md:leading-[26px]",
            "hover:border-primary-light focus:border-primary",
            "disabled:bg-border disabled:text-placeholder disabled:hover:border-border disabled:cursor-not-allowed",
            error && "border-error hover:border-error focus:border-error",
            className
          )}
          {...props}
        />
        {error && errorMessage && (
          <span
            id={errorId}
            role="alert"
            className="font-ibm-plex text-error text-xs leading-[23px] md:text-sm"
          >
            {errorMessage}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
