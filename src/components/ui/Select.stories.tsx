import { Fragment, useId, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { cn } from "@/lib/utils";

const options = ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"];

const meta = {
  title: "UI/Select",
  component: Select,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const Field = ({
  size,
  defaultOpen,
  defaultValue,
  disabled,
  error,
}: {
  size: "desktop" | "mobile";
  defaultOpen?: boolean;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
}) => {
  const textSize =
    size === "desktop"
      ? "text-base leading-[26px] md:text-base md:leading-[26px]"
      : "text-sm leading-[23px] md:text-sm md:leading-[23px]";
  const errorId = useId();
  const labelId = useId();
  const triggerId = useId();

  return (
    <div className="flex w-[200px] flex-col gap-1">
      <span id={labelId} className={cn("font-ibm-plex text-foreground font-medium", textSize)}>
        คณะ
      </span>
      <Select defaultOpen={defaultOpen} defaultValue={defaultValue} disabled={disabled}>
        <SelectTrigger
          id={triggerId}
          error={error}
          className={textSize}
          aria-labelledby={`${labelId} ${triggerId}`}
          aria-describedby={error ? errorId : undefined}
        >
          <SelectValue placeholder="เลือกคณะ" />
        </SelectTrigger>
        <SelectContent onCloseAutoFocus={(e) => e.preventDefault()}>
          {options.map((option) => (
            <SelectItem key={option} value={option} className={textSize}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <span id={errorId} className="font-ibm-plex text-error text-sm leading-[23px] font-medium">
          เกิดข้อผิดพลาด
        </span>
      )}
    </div>
  );
};

export const Default: Story = {
  render: () => <Field size="desktop" />,
};

export const WithSelectedValue: Story = {
  render: () => <Field size="desktop" defaultValue="ตัวเลือก 1" />,
};

export const Disabled: Story = {
  render: () => <Field size="desktop" disabled />,
};

export const WithError: Story = {
  render: () => <Field size="desktop" defaultValue="ตัวเลือก 1" error />,
};

export const HoverOption: Story = {
  render: () => <Field size="desktop" defaultOpen />,
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
    const rows: { label: string; desktop: ReactNode; mobile: ReactNode }[] = [
      {
        label: "Default",
        desktop: <Field size="desktop" />,
        mobile: <Field size="mobile" />,
      },
      {
        label: "Disable",
        desktop: <Field size="desktop" disabled />,
        mobile: <Field size="mobile" disabled />,
      },
      {
        label: "Hover Option",
        desktop: <Field size="desktop" defaultOpen />,
        mobile: <Field size="mobile" defaultOpen />,
      },
      {
        label: "Select Option",
        desktop: <Field size="desktop" defaultValue="ตัวเลือก 1" defaultOpen />,
        mobile: <Field size="mobile" defaultValue="ตัวเลือก 1" defaultOpen />,
      },
      {
        label: "Error",
        desktop: <Field size="desktop" defaultValue="ตัวเลือก 1" error />,
        mobile: <Field size="mobile" defaultValue="ตัวเลือก 1" error />,
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
