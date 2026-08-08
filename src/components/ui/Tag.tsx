import { type CSSProperties, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full px-3 py-1 font-ibm-plex font-medium text-xs leading-[20px] transition-colors md:text-sm md:leading-[23px]",
  {
    variants: {
      variant: {
        solid: "",
        outline:
          "border-[1.5px] border-primary bg-transparent text-primary hover:bg-primary-lighter",
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  }
);

export interface TagProps extends VariantProps<typeof tagVariants> {
  children: ReactNode;
  /** Text color for the `solid` variant. Any valid CSS color. Ignored by `outline`. */
  color?: string;
  /** Background color for the `solid` variant. Any valid CSS color. Ignored by `outline`. */
  bgColor?: string;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
}

/**
 * @example
 * // Static badge, brand colors
 * <Tag>เทคโนโลยี</Tag>
 *
 * @example
 * // Static badge, custom color
 * <Tag color="#0891b2" bgColor="#cffafe">เทคโนโลยี</Tag>
 *
 * @example
 * // Outline variant (always brand-colored, no color/bgColor)
 * <Tag variant="outline">เทคโนโลยี</Tag>
 *
 * @example
 * // Removable "selected" tag — clicking anywhere on it (not just the ×) removes it
 * <Tag color="#0891b2" bgColor="#cffafe" onRemove={() => removeCategory(id)}>
 *   เทคโนโลยี
 * </Tag>
 *
 * @example
 * // Clickable tag, e.g. toggling a filter
 * <Tag variant="outline" onClick={() => toggleFilter(id)}>เทคโนโลยี</Tag>
 */
const Tag = ({
  children,
  variant = "solid",
  color,
  bgColor,
  onClick,
  onRemove,
  className,
}: TagProps) => {
  const handleClick = onRemove ?? onClick;
  const clickable = Boolean(handleClick);

  const style: CSSProperties | undefined =
    variant === "solid"
      ? { color: color ?? "var(--primary)", backgroundColor: bgColor ?? "var(--primary-lighter)" }
      : undefined;

  const tagClassName = cn(tagVariants({ variant }), clickable && "cursor-pointer", className);

  if (!clickable) {
    return (
      <span className={tagClassName} style={style}>
        {children}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      style={style}
      aria-label={
        onRemove ? `ลบ ${typeof children === "string" ? children : ""}`.trim() : undefined
      }
      className={tagClassName}
    >
      {children}
      {onRemove && <X className="size-3.5" strokeWidth={2} />}
    </button>
  );
};

export { Tag };
