import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/ui";
import { ConfirmModal } from "./ConfirmModal";

const meta = {
  title: "Components/ConfirmModal",
  component: ConfirmModal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    open: false,
    onOpenChange: () => undefined,
    title: "ลบโพสต์",
    onConfirm: () => undefined,
  },
} satisfies Meta<typeof ConfirmModal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          ลบโพสต์
        </Button>
        <ConfirmModal
          open={open}
          onOpenChange={setOpen}
          title="ลบโพสต์"
          description="คุณต้องการลบโพสต์นี้ใช่หรือไม่"
          onConfirm={() => setOpen(false)}
        />
      </>
    );
  },
};

export const Loading: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        title="ลบโพสต์"
        description="คุณต้องการลบโพสต์นี้ใช่หรือไม่"
        isLoading
        onConfirm={() => undefined}
      />
    );
  },
};

export const CustomLabels: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <ConfirmModal
        open={open}
        onOpenChange={setOpen}
        title="ลบชมรม"
        description="การลบชมรมนี้จะลบข้อมูลทั้งหมดอย่างถาวรและไม่สามารถกู้คืนได้"
        confirmLabel="ลบชมรม"
        cancelLabel="ยกเลิก"
        onConfirm={() => setOpen(false)}
      />
    );
  },
};
