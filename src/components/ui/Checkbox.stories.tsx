import { useState } from "react";
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

const Labeled = ({ defaultChecked }: { defaultChecked?: boolean }) => {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <label className="flex items-center gap-2">
      <Checkbox checked={checked} onCheckedChange={(v) => setChecked(v === true)} />
      <span className="font-ibm-plex text-foreground text-sm leading-[23px]">ตัวอย่าง</span>
    </label>
  );
};

export const WithLabel: Story = {
  render: () => <Labeled />,
};

export const OptionList: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Labeled />
      <Labeled defaultChecked />
      <Labeled />
      <Labeled defaultChecked />
    </div>
  ),
};
