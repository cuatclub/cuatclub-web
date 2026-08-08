import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, errorMessage, className, wrapperClassName, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = useId();

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
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? errorId : undefined}
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
            className="font-ibm-plex text-error text-sm leading-[23px] font-medium"
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
