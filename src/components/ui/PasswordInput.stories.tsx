import { Fragment, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PasswordInput } from "./PasswordInput";
import { cn } from "@/lib/utils";

const meta = {
  title: "UI/PasswordInput",
  component: PasswordInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "รหัสผ่าน",
    placeholder: "กรอกรหัสผ่าน",
  },
} satisfies Meta<typeof PasswordInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Filled: Story = {
  args: {
    defaultValue: "password1234",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    defaultValue: "password1234",
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
          <PasswordInput
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
            wrapperClassName="w-[400px]"
            className={desktopSize}
          />
        ),
        mobile: (
          <PasswordInput
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
            wrapperClassName="w-[400px]"
            className={mobileSize}
          />
        ),
      },
      {
        label: "Hover",
        desktop: (
          <PasswordInput
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
            wrapperClassName="w-[400px]"
            className={cn(desktopSize, "border-primary-light")}
          />
        ),
        mobile: (
          <PasswordInput
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
            wrapperClassName="w-[400px]"
            className={cn(mobileSize, "border-primary-light")}
          />
        ),
      },
      {
        label: "Filled",
        desktop: (
          <PasswordInput
            label="รหัสผ่าน"
            defaultValue="password1234"
            wrapperClassName="w-[400px]"
            className={cn(desktopSize, "border-primary")}
          />
        ),
        mobile: (
          <PasswordInput
            label="รหัสผ่าน"
            defaultValue="password1234"
            wrapperClassName="w-[400px]"
            className={cn(mobileSize, "border-primary")}
          />
        ),
      },
      {
        label: "Disable",
        desktop: (
          <PasswordInput
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
            wrapperClassName="w-[400px]"
            className={desktopSize}
            disabled
          />
        ),
        mobile: (
          <PasswordInput
            label="รหัสผ่าน"
            placeholder="กรอกรหัสผ่าน"
            wrapperClassName="w-[400px]"
            className={mobileSize}
            disabled
          />
        ),
      },
      {
        label: "Error",
        desktop: (
          <PasswordInput
            label="รหัสผ่าน"
            defaultValue="password1234"
            wrapperClassName="w-[400px]"
            className={desktopSize}
            error
            errorMessage="เกิดข้อผิดพลาด"
          />
        ),
        mobile: (
          <PasswordInput
            label="รหัสผ่าน"
            defaultValue="password1234"
            wrapperClassName="w-[400px]"
            className={mobileSize}
            error
            errorMessage="เกิดข้อผิดพลาด"
          />
        ),
      },
      {
        label: "Eye Open",
        desktop: (
          <PasswordInput
            label="รหัสผ่าน"
            defaultValue="password1234"
            defaultVisible
            wrapperClassName="w-[400px]"
            className={cn(desktopSize, "border-primary")}
          />
        ),
        mobile: (
          <PasswordInput
            label="รหัสผ่าน"
            defaultValue="password1234"
            defaultVisible
            wrapperClassName="w-[400px]"
            className={cn(mobileSize, "border-primary")}
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
