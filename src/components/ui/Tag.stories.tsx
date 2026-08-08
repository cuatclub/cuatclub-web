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
  argTypes: {
    type: {
      control: "radio",
      options: ["solid", "selectable"],
    },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Static badge — never clickable. */
export const Solid: Story = {
  args: {
    color: "#0891b2",
    bgColor: "#cffafe",
  },
};

/** Selectable tag, unselected — outline style. */
export const SelectableUnselected: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(false);
    return (
      <Tag
        {...args}
        type="selectable"
        selected={selected}
        onClick={() => setSelected((prev) => !prev)}
      />
    );
  },
};

/** Selectable tag, selected — solid style with a × to deselect. */
export const SelectableSelected: Story = {
  render: (args) => {
    const [selected, setSelected] = useState(true);
    return (
      <Tag
        {...args}
        type="selectable"
        color="#0891b2"
        bgColor="#cffafe"
        selected={selected}
        onClick={() => setSelected((prev) => !prev)}
      />
    );
  },
};

/** Click a tag to toggle it between outline (unselected) and solid + × (selected). */
export const SelectableList: Story = {
  render: () => {
    const initial = [
      { id: 1, label: "เทคโนโลยี", color: "#0891b2", bgColor: "#cffafe", selected: false },
      { id: 2, label: "กีฬา", color: "#db2777", bgColor: "#fce7f3", selected: true },
      { id: 3, label: "ดนตรี", color: "#65a30d", bgColor: "#ecfccb", selected: false },
    ];
    const [tags, setTags] = useState(initial);

    return (
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Tag
            key={tag.id}
            type="selectable"
            color={tag.color}
            bgColor={tag.bgColor}
            selected={tag.selected}
            onClick={() =>
              setTags((prev) =>
                prev.map((t) => (t.id === tag.id ? { ...t, selected: !t.selected } : t))
              )
            }
          >
            {tag.label}
          </Tag>
        ))}
      </div>
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
        label: "Selectable — unselected",
        desktop: (
          <Tag type="selectable" selected={false} onClick={fn()} className={desktopSize}>
            เทคโนโลยี
          </Tag>
        ),
        mobile: (
          <Tag type="selectable" selected={false} onClick={fn()} className={mobileSize}>
            เทคโนโลยี
          </Tag>
        ),
      },
      {
        label: "Selectable — selected",
        desktop: (
          <Tag
            type="selectable"
            selected
            onClick={fn()}
            color="#0891b2"
            bgColor="#cffafe"
            className={desktopSize}
          >
            เทคโนโลยี
          </Tag>
        ),
        mobile: (
          <Tag
            type="selectable"
            selected
            onClick={fn()}
            color="#db2777"
            bgColor="#fce7f3"
            className={mobileSize}
          >
            เทคโนโลยี
          </Tag>
        ),
      },
      {
        label: "Selectable — hover",
        desktop: (
          <Tag
            type="selectable"
            selected={false}
            onClick={fn()}
            className={cn(desktopSize, "bg-primary-lighter")}
          >
            เทคโนโลยี
          </Tag>
        ),
        mobile: (
          <Tag
            type="selectable"
            selected={false}
            onClick={fn()}
            className={cn(mobileSize, "bg-primary-lighter")}
          >
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
