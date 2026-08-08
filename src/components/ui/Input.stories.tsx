import { Fragment, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./Input";
import { cn } from "@/lib/utils";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "อีเมล",
    placeholder: "example@gmail.com",
    type: "email",
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    defaultValue: "example@gmail.com",
    error: true,
    errorMessage: "เกิดข้อผิดพลาด",
  },
};

export const AllStates: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    const desktopSize = "text-base leading-[26px] md:text-base md:leading-[26px]";
    const mobileSize = "text-sm leading-[23px] md:text-sm md:leading-[23px]";

    const rows: { label: string; desktop: ReactNode; mobile: ReactNode }[] = [
      {
        label: "Default",
        desktop: (
          <Input
            label="อีเมล"
            placeholder="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={desktopSize}
          />
        ),
        mobile: (
          <Input
            label="อีเมล"
            placeholder="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={mobileSize}
          />
        ),
      },
      {
        label: "Hover",
        desktop: (
          <Input
            label="อีเมล"
            placeholder="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={cn(desktopSize, "border-primary-light")}
          />
        ),
        mobile: (
          <Input
            label="อีเมล"
            placeholder="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={cn(mobileSize, "border-primary-light")}
          />
        ),
      },
      {
        label: "Focus",
        desktop: (
          <Input
            label="อีเมล"
            placeholder="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={cn(desktopSize, "border-primary")}
          />
        ),
        mobile: (
          <Input
            label="อีเมล"
            placeholder="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={cn(mobileSize, "border-primary")}
          />
        ),
      },
      {
        label: "Disable",
        desktop: (
          <Input
            label="อีเมล"
            placeholder="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={desktopSize}
            disabled
          />
        ),
        mobile: (
          <Input
            label="อีเมล"
            placeholder="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={mobileSize}
            disabled
          />
        ),
      },
      {
        label: "Error",
        desktop: (
          <Input
            label="อีเมล"
            defaultValue="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={desktopSize}
            error
            errorMessage="เกิดข้อผิดพลาด"
          />
        ),
        mobile: (
          <Input
            label="อีเมล"
            defaultValue="example@gmail.com"
            wrapperClassName="w-[400px]"
            className={mobileSize}
            error
            errorMessage="เกิดข้อผิดพลาด"
          />
        ),
      },
    ];

    return (
      <div className="grid grid-cols-[80px_400px_400px] items-start gap-x-16 gap-y-10 p-10">
        <div />
        <div className="text-center text-xl font-semibold">Desktop</div>
        <div className="text-center text-xl font-semibold">Mobile</div>

        {rows.map((row) => (
          <Fragment key={row.label}>
            <div className="text-foreground-secondary pt-2 text-sm">{row.label}</div>
            <div>{row.desktop}</div>
            <div>{row.mobile}</div>
          </Fragment>
        ))}
      </div>
    );
  },
};
