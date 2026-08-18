"use client";

import { createContext, useContext } from "react";
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui";
import { type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { toggleVariants } from "@/components/ui/Toggle";

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
