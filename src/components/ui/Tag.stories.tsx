import { Fragment, type ReactNode } from "react";
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
    color: "cyan",
  },
};

export const Selected: Story = {
  args: {
    variant: "solid",
    color: "cyan",
    onRemove: fn(),
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
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
          <Tag color="cyan" onRemove={fn()} className={desktopSize}>
            เทคโนโลยี
          </Tag>
        ),
        mobile: (
          <Tag color="pink" onRemove={fn()} className={mobileSize}>
            เทคโนโลยี
          </Tag>
        ),
      },
      {
        label: "Solid",
        desktop: (
          <Tag color="cyan" className={desktopSize}>
            เทคโนโลยี
          </Tag>
        ),
        mobile: (
          <Tag color="pink" className={mobileSize}>
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
