import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Separator } from "./Separator";

const meta = {
  title: "UI/Separator",
  component: Separator,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
    },
  },
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <div className="text-sm">อีเวนต์ไฟน์เดอร์</div>
      <Separator className="my-4" />
      <div className="text-foreground-muted text-sm">ค้นหาชมรมและกิจกรรมในมหาวิทยาลัย</div>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex h-5 items-center gap-4 text-sm">
      <div>บล็อก</div>
      <Separator orientation="vertical" />
      <div>เอกสาร</div>
    </div>
  ),
};

export const Example: Story = {
  render: () => (
    <div className="w-64">
      <div className="text-sm font-medium">อีเวนต์ไฟน์เดอร์</div>
      <div className="text-foreground-muted text-sm">ค้นหาชมรมและกิจกรรมในมหาวิทยาลัย</div>
      <Separator className="my-4" />
      <div className="flex h-5 items-center gap-4 text-sm">
        <div>บล็อก</div>
        <Separator orientation="vertical" />
        <div>เอกสาร</div>
        <Separator orientation="vertical" />
        <div>ซอร์สโค้ด</div>
      </div>
    </div>
  ),
};
