import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center h-[40px] gap-3 rounded-lg px-6 font-ibm-plex font-semibold text-sm leading-[23px] md:text-base md:leading-[26px] transition-colors cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default: "text-white",
        outline: "border bg-transparent",
      },
      color: {
        primary: "",
        destructive: "",
      },
    },
    compoundVariants: [
      {
        variant: "default",
        color: "primary",
        className: "bg-primary hover:bg-primary/90 disabled:bg-primary-light",
      },
      {
        variant: "default",
        color: "destructive",
        className: "bg-error hover:bg-error/90 disabled:bg-error/40",
      },
      {
        variant: "outline",
        color: "primary",
        className:
          "border-primary text-primary hover:bg-primary-lighter disabled:border-primary-light disabled:text-primary-light",
      },
      {
        variant: "outline",
        color: "destructive",
        className:
          "border-error text-error hover:bg-error/10 disabled:border-error/40 disabled:text-error/40",
      },
    ],
    defaultVariants: {
      variant: "default",
      color: "primary",
    },
  }
);

type Variant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type Color = NonNullable<VariantProps<typeof buttonVariants>["color"]>;

/**
 * `isLoading` still sets native `disabled` (blocks clicks, prevents double-submit), but the
 * button should keep looking like its normal, interactive self rather than the grayed-out
 * `disabled:` variant — that state is reserved for an actually-invalid/disabled action.
 */
const loadingVariantOverride: Record<Variant, Record<Color, string>> = {
  default: {
    primary: "disabled:bg-primary",
    destructive: "disabled:bg-error",
  },
  outline: {
    primary: "disabled:border-primary disabled:text-primary",
    destructive: "disabled:border-error disabled:text-error",
  },
};

export interface ButtonProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "color">,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, color, isLoading, disabled, children, ...props }, ref) => {
    const resolvedVariant = variant ?? "default";
    const resolvedColor = color ?? "primary";

    return (
      <button
        ref={ref}
        className={cn(
          buttonVariants({ variant, color }),
          isLoading && loadingVariantOverride[resolvedVariant][resolvedColor],
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
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
