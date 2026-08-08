import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps extends ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string;
  labelSize?: number;
}

const Checkbox = forwardRef<ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, label, labelSize = 14, disabled, ...props }, ref) => {
    const box = (
      <CheckboxPrimitive.Root
        ref={ref}
        disabled={disabled}
        className={cn(
          "peer border-foreground-secondary/30 size-4 shrink-0 cursor-pointer rounded-[2px] border bg-transparent",
          "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-white">
          <Check className="size-3.5" strokeWidth={3} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    );

    if (!label) {
      return box;
    }

    return (
      <label
        className={cn(
          "inline-flex cursor-pointer items-center gap-2",
          disabled && "cursor-not-allowed"
        )}
      >
        {box}
        <span className="font-ibm-plex text-foreground" style={{ fontSize: labelSize }}>
          {label}
        </span>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
