import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "UI/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {
  args: {
    "aria-label": "ตัวอย่าง",
  },
};

export const Checked: Story = {
  args: {
    "aria-label": "ตัวอย่าง",
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  args: {
    "aria-label": "ตัวอย่าง",
    disabled: true,
  },
};

export const WithLabel: Story = {
  args: {
    label: "ตัวอย่าง",
  },
};

export const OptionList: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="ตัวอย่าง" />
      <Checkbox label="ตัวอย่าง" defaultChecked />
      <Checkbox label="ตัวอย่าง" />
      <Checkbox label="ตัวอย่าง" defaultChecked />
    </div>
  ),
};
