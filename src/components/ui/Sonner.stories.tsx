import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toaster, toast } from "./Sonner";
import { Button } from "./Button";

const meta = {
  title: "UI/Sonner",
  component: Toaster,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Confirms a save. Top-right from `md` up, bottom-center below it — resize the canvas to see it move. */
export const Success: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button onClick={() => toast.success("บันทึกข้อมูลชมรมเรียบร้อย")}>บันทึก</Button>
    </>
  ),
};

/** Same outlet, error styling — the app reports failures inline today, so this is for reference. */
export const Failure: Story = {
  render: (args) => (
    <>
      <Toaster {...args} />
      <Button color="destructive" onClick={() => toast.error("ไม่สามารถบันทึกข้อมูลได้")}>
        บันทึก
      </Button>
    </>
  ),
};
