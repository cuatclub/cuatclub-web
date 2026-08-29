import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center h-[40px] gap-3 rounded-lg px-6 font-ibm-plex font-semibold text-sm leading-[23px] md:text-base md:leading-[26px] transition-colors cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        primary: "bg-primary text-white hover:bg-primary/90 disabled:bg-primary-light",
        outline:
          "border border-primary bg-transparent text-primary hover:bg-primary-lighter disabled:border-primary-light disabled:text-primary-light",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  }
);

/**
 * `isLoading` still sets native `disabled` (blocks clicks, prevents double-submit), but the
 * button should keep looking like its normal, interactive self rather than the grayed-out
 * `disabled:` variant — that state is reserved for an actually-invalid/disabled action.
 */
const loadingVariantOverride: Record<"primary" | "outline", string> = {
  primary: "disabled:bg-primary",
  outline: "disabled:border-primary disabled:text-primary",
};

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        buttonVariants({ variant }),
        isLoading && loadingVariantOverride[variant ?? "primary"],
        className
      )}
      aria-busy={isLoading ?? undefined}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 aria-hidden="true" className="size-4 shrink-0 animate-spin" />
          <span className="sr-only">{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
