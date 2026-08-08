import { Fragment, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Select } from "./Select";

const options = ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"];

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "คณะ",
    placeholder: "เลือกคณะ",
    options,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelectedValue: Story = {
  args: {
    defaultValue: "ตัวเลือก 1",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    defaultValue: "ตัวเลือก 1",
    error: true,
    errorMessage: "เกิดข้อผิดพลาด",
  },
};

export const HoverOption: Story = {
  args: {
    defaultOpen: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement.ownerDocument.body);
    const option = await canvas.findByText("ตัวเลือก 1");
    await userEvent.hover(option);
    await expect(option.closest('[role="option"]')).toHaveAttribute("data-highlighted");
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
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={desktopSize}
          />
        ),
        mobile: (
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={mobileSize}
          />
        ),
      },
      {
        label: "Disable",
        desktop: (
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={desktopSize}
            disabled
          />
        ),
        mobile: (
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={mobileSize}
            disabled
          />
        ),
      },
      {
        label: "Hover Option",
        desktop: (
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={desktopSize}
            defaultOpen
          />
        ),
        mobile: (
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={mobileSize}
            defaultOpen
          />
        ),
      },
      {
        label: "Select Option",
        desktop: (
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={desktopSize}
            defaultValue="ตัวเลือก 1"
            defaultOpen
          />
        ),
        mobile: (
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={mobileSize}
            defaultValue="ตัวเลือก 1"
            defaultOpen
          />
        ),
      },
      {
        label: "Error",
        desktop: (
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={desktopSize}
            defaultValue="ตัวเลือก 1"
            error
            errorMessage="เกิดข้อผิดพลาด"
          />
        ),
        mobile: (
          <Select
            label="คณะ"
            placeholder="เลือกคณะ"
            options={options}
            className="w-[200px]"
            triggerClassName={mobileSize}
            defaultValue="ตัวเลือก 1"
            error
            errorMessage="เกิดข้อผิดพลาด"
          />
        ),
      },
    ];

    return (
      <div className="grid grid-cols-[80px_200px_200px] items-start gap-x-16 gap-y-10 p-10">
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
