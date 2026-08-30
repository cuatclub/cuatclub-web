"use client";

import { forwardRef, useId, useState, type InputHTMLAttributes } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  wrapperClassName?: string;
  defaultVisible?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      error,
      errorMessage,
      className,
      wrapperClassName,
      id,
      disabled,
      defaultVisible,
      "aria-invalid": _ariaInvalid,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] = useState(defaultVisible ?? false);
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
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            type={visible ? "text" : "password"}
            disabled={disabled}
            aria-invalid={error}
            aria-describedby={describedByIds || undefined}
            className={cn(
              "border-border font-ibm-plex text-foreground placeholder:text-placeholder flex h-10 w-full items-center rounded-lg border bg-white px-3 pr-9 text-sm leading-[23px] transition-colors outline-none md:text-base md:leading-[26px]",
              "hover:border-primary-light focus:border-primary",
              "disabled:bg-border disabled:text-placeholder disabled:hover:border-border disabled:cursor-not-allowed",
              error && "border-error hover:border-error focus:border-error",
              className
            )}
            {...props}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            aria-label={visible ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            className={cn(
              "text-foreground absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center disabled:cursor-not-allowed",
              disabled && "text-placeholder"
            )}
          >
            {visible ? (
              <Eye className="size-4" strokeWidth={2} />
            ) : (
              <EyeClosed className="size-4" strokeWidth={2} />
            )}
          </button>
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
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
