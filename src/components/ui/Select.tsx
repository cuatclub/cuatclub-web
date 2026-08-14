import { forwardRef, useId, type ComponentPropsWithoutRef, type ElementRef } from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const SelectRoot = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;

const textSize = "text-sm leading-[23px] md:text-base md:leading-[26px]";

const SelectTrigger = forwardRef<
  ElementRef<typeof SelectPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { error?: boolean }
>(({ className, error, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "border-border font-ibm-plex text-foreground group flex h-10 w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg border bg-white px-3 py-0 transition-colors",
      textSize,
      "hover:border-primary-light data-[state=open]:border-primary",
      "data-[placeholder]:text-placeholder",
      "disabled:bg-border disabled:text-placeholder disabled:hover:border-border disabled:cursor-not-allowed",
      error && "border-error hover:border-error data-[state=open]:border-error",
      className
    )}
    aria-invalid={error}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="text-placeholder size-4 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectContent = forwardRef<
  ElementRef<typeof SelectPrimitive.Content>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      className={cn(
        "border-border relative z-50 overflow-hidden rounded-lg border bg-white p-1.5 shadow-black",
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper"
          ? "max-h-[var(--radix-select-content-available-height)] w-[var(--radix-select-trigger-width)] translate-y-1"
          : "max-h-96",
        className
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="flex flex-col gap-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = forwardRef<
  ElementRef<typeof SelectPrimitive.Label>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("text-foreground-secondary px-2 py-1.5 text-sm font-medium", className)}
    {...props}
  />
));
SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "font-ibm-plex text-foreground relative flex w-full cursor-pointer items-center rounded-md px-2 py-2 outline-none select-none",
      textSize,
      "data-[highlighted]:bg-primary-lighter data-[highlighted]:text-primary",
      "data-[state=checked]:bg-primary data-[state=checked]:text-white",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
));
SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = forwardRef<
  ElementRef<typeof SelectPrimitive.Separator>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("bg-border -mx-1 my-1 h-px", className)}
    {...props}
  />
));
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: string[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  name?: string;
  className?: string;
  triggerClassName?: string;
}

const Select = ({
  label,
  placeholder,
  options,
  value,
  defaultValue,
  onValueChange,
  defaultOpen,
  open,
  onOpenChange,
  disabled,
  error,
  errorMessage,
  name,
  className,
  triggerClassName,
}: SelectProps) => {
  const labelId = useId();
  const triggerId = useId();
  const errorId = useId();

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span id={labelId} className={cn("font-ibm-plex text-foreground font-medium", textSize)}>
          {label}
        </span>
      )}
      <SelectRoot
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        defaultOpen={defaultOpen}
        open={open}
        onOpenChange={onOpenChange}
        disabled={disabled}
        name={name}
      >
        <SelectTrigger
          id={triggerId}
          error={error}
          className={triggerClassName}
          aria-labelledby={label ? `${labelId} ${triggerId}` : undefined}
          aria-describedby={error && errorMessage ? errorId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </SelectRoot>
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
};

export {
  Select,
  SelectRoot,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
};
