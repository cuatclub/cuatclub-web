"use client";

import { Toggle as TogglePrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Restyled with this project's own tokens (primary/border), not shadcn's
// default accent/ring/input tokens — this project's Tailwind theme (see
// src/styles/globals.css) never defines those, so the stock shadcn classes
// would silently compile to nothing. Mirrors Button's outline variant so a
// row of these (ToggleGroup) merges into one continuously-bordered pill.
const toggleVariants = cva(
  "font-ibm-plex inline-flex h-[40px] items-center justify-center gap-2 rounded-lg border border-primary bg-transparent px-6 text-sm leading-[23px] font-semibold text-primary transition-colors outline-none md:text-base md:leading-[26px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        outline:
          "hover:bg-primary-lighter data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:hover:bg-primary/90 disabled:pointer-events-none disabled:cursor-not-allowed disabled:border-primary-light disabled:text-primary-light disabled:hover:bg-transparent disabled:data-[state=on]:bg-primary-light",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
);

function Toggle({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, className }))}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
