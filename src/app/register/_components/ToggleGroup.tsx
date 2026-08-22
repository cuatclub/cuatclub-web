"use client";

import { createContext, useContext } from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const toggleVariants = cva(
  "font-ibm-plex inline-flex h-[40px] items-center justify-center gap-2 rounded-lg border border-primary bg-transparent px-6 text-sm leading-[23px] font-semibold text-primary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 md:text-base md:leading-[26px] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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

type ToggleGroupContextValue = VariantProps<typeof toggleVariants> & {
  orientation?: "horizontal" | "vertical";
};

const ToggleGroupContext = createContext<ToggleGroupContextValue>({
  variant: "outline",
  orientation: "horizontal",
});

function ToggleGroup({
  className,
  variant,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      orientation={orientation}
      className={cn(
        "group/toggle-group flex w-fit items-stretch",
        orientation === "vertical" && "flex-col",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, orientation }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = useContext(ToggleGroupContext);
  const orientation = context.orientation ?? "horizontal";

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant ?? variant}
      className={cn(
        toggleVariants({ variant: context.variant ?? variant }),
        "min-w-0 flex-1 shrink-0 rounded-none focus:z-10 focus-visible:z-10",
        orientation === "horizontal"
          ? "border-l-0 first:rounded-l-lg first:border-l last:rounded-r-lg"
          : "border-t-0 first:rounded-t-lg first:border-t last:rounded-b-lg",
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
