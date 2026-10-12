import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DateRangeField } from "./DateRangeField";

const meta = {
  title: "UI/DateRangeField",
  component: DateRangeField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "ช่วงเวลา",
    startValue: null,
    endValue: null,
    onChange: () => undefined,
  },
  render: (args) => {
    const [start, setStart] = useState<Date | null>(args.startValue);
    const [end, setEnd] = useState<Date | null>(args.endValue);
    return (
      <div className="w-[347px]">
        <DateRangeField
          {...args}
          startValue={start}
          endValue={end}
          onChange={(nextStart, nextEnd) => {
            setStart(nextStart);
            setEnd(nextEnd);
          }}
        />
      </div>
    );
  },
} satisfies Meta<typeof DateRangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithRange: Story = {
  args: {
    required: true,
    startValue: new Date(2026, 8, 6),
    endValue: new Date(2026, 8, 13),
  },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const WithError: Story = {
  args: {
    error: true,
    errorMessage: "กรุณาเลือกช่วงเวลา",
  },
};
