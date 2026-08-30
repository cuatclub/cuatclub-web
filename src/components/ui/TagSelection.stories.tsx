import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TagSelection } from "./TagSelection";

const coloredOptions = [
  { value: "tech", label: "เทคโนโลยี", color: "#0891b2", bgColor: "#cffafe" },
  { value: "sport", label: "กีฬา", color: "#db2777", bgColor: "#fce7f3" },
  { value: "music", label: "ดนตรี", color: "#65a30d", bgColor: "#ecfccb" },
  { value: "art", label: "ศิลปะ", color: "#d97706", bgColor: "#fef3c7" },
];

const plainOptions = [
  { value: "y1", label: "ปี 1" },
  { value: "y2", label: "ปี 2" },
  { value: "y3", label: "ปี 3" },
  { value: "y4", label: "ปี 4" },
];

const meta = {
  title: "UI/TagSelection",
  component: TagSelection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "หมวดหมู่",
    options: coloredOptions,
  },
} satisfies Meta<typeof TagSelection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelectedValues: Story = {
  args: {
    defaultValue: ["tech", "music"],
  },
};

export const WithoutColors: Story = {
  args: {
    label: "ชั้นปี",
    required: true,
    options: plainOptions,
    defaultValue: ["y1"],
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: ["tech"],
  },
};

export const WithError: Story = {
  args: {
    defaultValue: ["tech"],
    error: true,
    errorMessage: "กรุณาเลือกอย่างน้อย 1 รายการ",
  },
};

export const WithTrailing: Story = {
  args: {
    label: undefined,
    options: plainOptions,
    defaultValue: ["y1"],
    trailing: (
      <button
        type="button"
        className="font-ibm-plex text-foreground-secondary hover:text-primary cursor-pointer text-sm font-medium underline-offset-4 hover:underline"
      >
        เลือกทั้งหมด
      </button>
    ),
  },
};
