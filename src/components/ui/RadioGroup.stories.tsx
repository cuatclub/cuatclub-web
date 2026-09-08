import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { RadioGroup } from "./RadioGroup";

const audienceOptions = [
  { value: "CHULA_STUDENT", label: "นิสิตจุฬาฯ" },
  { value: "GENERAL_PUBLIC", label: "บุคคลทั่วไป" },
];

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    label: "ผู้มีสิทธิ์เข้าร่วม",
    options: audienceOptions,
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelectedValue: Story = {
  args: {
    required: true,
    defaultValue: "CHULA_STUDENT",
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
    defaultValue: "GENERAL_PUBLIC",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: "CHULA_STUDENT",
  },
};

export const WithError: Story = {
  args: {
    error: true,
    errorMessage: "กรุณาเลือกผู้มีสิทธิ์เข้าร่วม",
  },
};
