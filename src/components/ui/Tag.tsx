import { type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const tagColors = [
  "purple",
  "pink",
  "red",
  "orange",
  "yellow",
  "lime",
  "green",
  "cyan",
  "blue",
  "slate",
] as const;
export type TagColor = (typeof tagColors)[number];

const solidColorClasses: Record<TagColor, string> = {
  purple: "bg-tag-purple-light text-tag-purple",
  pink: "bg-tag-pink-light text-tag-pink",
  red: "bg-tag-red-light text-tag-red",
  orange: "bg-tag-orange-light text-tag-orange",
  yellow: "bg-tag-yellow-light text-tag-yellow",
  lime: "bg-tag-lime-light text-tag-lime",
  green: "bg-tag-green-light text-tag-green",
  cyan: "bg-tag-cyan-light text-tag-cyan",
  blue: "bg-tag-blue-light text-tag-blue",
  slate: "bg-tag-slate-light text-tag-slate",
};

const tagVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full px-3 py-1 font-ibm-plex font-medium text-xs leading-[20px] transition-colors md:text-sm md:leading-[23px]",
  {
    variants: {
      variant: {
        solid: "",
        outline:
          "border-[1.5px] border-primary bg-transparent text-primary hover:bg-primary-lighter hover:cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  }
);

export interface TagProps extends VariantProps<typeof tagVariants> {
  children: ReactNode;
  color?: TagColor;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

const Tag = ({
  children,
  variant = "solid",
  color = "pink",
  onClick,
  onRemove,
  className,
}: TagProps) => {
  const handleClick = onRemove ?? onClick;
  const clickable = Boolean(handleClick);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={
        onRemove ? `ลบ ${typeof children === "string" ? children : ""}`.trim() : undefined
      }
      className={cn(
        tagVariants({ variant }),
        variant === "solid" && solidColorClasses[color],
        clickable && "cursor-pointer",
        className
      )}
    >
      {children}
      {onRemove && <X className="size-3.5" strokeWidth={2} />}
    </button>
  );
};

export { Tag };
