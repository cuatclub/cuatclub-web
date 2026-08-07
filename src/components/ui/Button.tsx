import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 rounded-lg px-6 py-3 font-ibm-plex font-semibold text-sm leading-[23px] md:text-base md:leading-[26px] transition-colors cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed",
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

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, isLoading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant }), isLoading && "w-[92px] md:w-[98px]", className)}
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- boolean OR intended, not nullish fallback
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="size-4 shrink-0 animate-spin" /> : children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
