import { Fragment, useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Tag } from "./Tag";
import { cn } from "@/lib/utils";

const meta = {
  title: "UI/Tag",
  component: Tag,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    children: "เทคโนโลยี",
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Solid: Story = {
  args: {
    variant: "solid",
    color: "#0891b2",
    bgColor: "#cffafe",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
  },
};

/** Click the × — the tag actually gets removed from the list below. */
export const RemovableList: Story = {
  render: () => {
    const initial = [
      { id: 1, label: "เทคโนโลยี", color: "#0891b2", bgColor: "#cffafe" },
      { id: 2, label: "กีฬา", color: "#db2777", bgColor: "#fce7f3" },
      { id: 3, label: "ดนตรี", color: "#65a30d", bgColor: "#ecfccb" },
    ];
    const [tags, setTags] = useState(initial);

    return (
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 && <span className="text-foreground-secondary text-sm">ไม่มีแท็ก</span>}
        {tags.map((tag) => (
          <Tag
            key={tag.id}
            color={tag.color}
            bgColor={tag.bgColor}
            onRemove={() => setTags((prev) => prev.filter((t) => t.id !== tag.id))}
          >
            {tag.label}
          </Tag>
        ))}
      </div>
    );
  },
};

/** Click the tag — it toggles between solid (selected) and outline (unselected). */
export const ClickableFilter: Story = {
  render: () => {
    const [selected, setSelected] = useState(false);

    return (
      <Tag
        variant={selected ? "solid" : "outline"}
        color={selected ? "#0891b2" : undefined}
        bgColor={selected ? "#cffafe" : undefined}
        onClick={() => setSelected((prev) => !prev)}
      >
        เทคโนโลยี
      </Tag>
    );
  },
};

export const AllStates: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    const desktopSize = "text-sm leading-[23px] md:text-sm md:leading-[23px]";
    const mobileSize = "text-xs leading-[20px] md:text-xs md:leading-[20px]";

    const rows: { label: string; desktop: ReactNode; mobile: ReactNode }[] = [
      {
        label: "Selected",
        desktop: (
          <Tag color="#0891b2" bgColor="#cffafe" onRemove={fn()} className={desktopSize}>
            เทคโนโลยี
          </Tag>
        ),
        mobile: (
          <Tag color="#db2777" bgColor="#fce7f3" onRemove={fn()} className={mobileSize}>
            เทคโนโลยี
          </Tag>
        ),
      },
      {
        label: "Solid",
        desktop: (
          <Tag color="#0891b2" bgColor="#cffafe" className={desktopSize}>
            เทคโนโลยี
          </Tag>
        ),
        mobile: (
          <Tag color="#db2777" bgColor="#fce7f3" className={mobileSize}>
            เทคโนโลยี
          </Tag>
        ),
      },
      {
        label: "Outline",
        desktop: (
          <Tag variant="outline" className={desktopSize}>
            เทคโนโลยี
          </Tag>
        ),
        mobile: (
          <Tag variant="outline" className={mobileSize}>
            เทคโนโลยี
          </Tag>
        ),
      },
      {
        label: "Hover",
        desktop: (
          <Tag variant="outline" className={cn(desktopSize, "bg-primary-lighter")}>
            เทคโนโลยี
          </Tag>
        ),
        mobile: (
          <Tag variant="outline" className={cn(mobileSize, "bg-primary-lighter")}>
            เทคโนโลยี
          </Tag>
        ),
      },
    ];

    return (
      <div className="grid grid-cols-[80px_auto_auto] items-center gap-x-16 gap-y-6 p-10">
        <div />
        <div className="text-center text-xl font-semibold">Desktop</div>
        <div className="text-center text-xl font-semibold">Mobile</div>

        {rows.map((row) => (
          <Fragment key={row.label}>
            <div className="text-foreground-secondary text-sm">{row.label}</div>
            <div>{row.desktop}</div>
            <div>{row.mobile}</div>
          </Fragment>
        ))}
      </div>
    );
  },
};
