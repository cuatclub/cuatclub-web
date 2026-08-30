import { type CSSProperties, type ReactNode } from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const tagVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full px-3 py-1 font-ibm-plex font-medium text-xs leading-[20px] transition-colors md:text-sm md:leading-[23px]",
  {
    variants: {
      variant: {
        solid: "border-[1.5px]",
        outline: "border-[1.5px] border-border bg-transparent text-foreground hover:border-primary",
      },
    },
    defaultVariants: {
      variant: "solid",
    },
  }
);

interface BaseTagProps {
  children: ReactNode;
  /** Text color. Any valid CSS color. Only applied when the tag is rendered solid. */
  color?: string;
  /** Background color. Any valid CSS color. Only applied when the tag is rendered solid. */
  bgColor?: string;
  className?: string;
}

export interface SolidTagProps extends BaseTagProps {
  /** Static badge — never clickable. This is the default. */
  type?: "solid";
}

export interface SelectableTagProps extends BaseTagProps {
  /** Interactive toggle — outline when unselected, solid with a × when selected. */
  type: "selectable";
  selected: boolean;
  onClick: () => void;
}

export type TagProps = SolidTagProps | SelectableTagProps;

const solidStyle = (color?: string, bgColor?: string): CSSProperties => {
  const background = bgColor ?? "var(--primary-lighter)";
  return {
    color: color ?? "var(--primary)",
    backgroundColor: background,
    borderColor: background,
  };
};

/**
 * @example
 * // Static badge, brand colors — never clickable
 * <Tag>เทคโนโลยี</Tag>
 *
 * @example
 * // Static badge, custom color
 * <Tag color="#0891b2" bgColor="#cffafe">เทคโนโลยี</Tag>
 *
 * @example
 * // Selectable tag — outline by default, solid with × once selected
 * <Tag type="selectable" selected={isSelected} onClick={() => toggle(id)}>
 *   เทคโนโลยี
 * </Tag>
 */
const Tag = (props: TagProps) => {
  const { children, color, bgColor, className } = props;

  if (props.type === "selectable") {
    const { selected, onClick } = props;

    return (
      <button
        type="button"
        onClick={onClick}
        style={selected ? solidStyle(color, bgColor) : undefined}
        aria-pressed={selected}
        className={cn(
          tagVariants({ variant: selected ? "solid" : "outline" }),
          "cursor-pointer",
          className
        )}
      >
        {children}
        {selected && <X className="size-3.5" strokeWidth={2} />}
      </button>
    );
  }

  return (
    <span
      className={cn(tagVariants({ variant: "solid" }), className)}
      style={solidStyle(color, bgColor)}
    >
      {children}
    </span>
  );
};

export { Tag };
