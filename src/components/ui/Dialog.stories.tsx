import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { X } from "lucide-react";
import { Button } from "./Button";
import { Checkbox } from "./Checkbox";
import { DialogClose, DialogContent, DialogDescription, DialogRoot, DialogTitle } from "./Dialog";

const meta = {
  title: "UI/Dialog",
  component: DialogContent,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof DialogContent>;

export default meta;
type Story = StoryObj<typeof meta>;

const closeButtonClass =
  "text-foreground-secondary hover:bg-surface hover:text-foreground focus-visible:ring-primary flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none";

/**
 * The default `centered` placement: a right-hand drawer below `md` and a centred dialog above it —
 * narrow the preview to see it change. The shell brings positioning, motion, and the focus trap;
 * the panel lays out its own header, body, and footer.
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>เปิดตัวกรอง</Button>
        <DialogRoot open={open} onOpenChange={setOpen}>
          <DialogContent>
            <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-4 md:px-6 md:py-5">
              <DialogTitle>ตัวกรอง</DialogTitle>
              <DialogClose aria-label="ปิด" className={closeButtonClass}>
                <X aria-hidden="true" className="size-5" />
              </DialogClose>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-5 py-5 md:px-6">
              <DialogDescription>เลือกสังกัดที่ต้องการ แล้วกดดูผลลัพธ์</DialogDescription>
              {["วิศวกรรมศาสตร์", "อักษรศาสตร์", "นิเทศศาสตร์", "วิทยาศาสตร์"].map((label) => (
                <Checkbox key={label} label={label} />
              ))}
            </div>

            <div className="border-border flex items-center justify-between gap-3 border-t px-5 py-4 md:px-6">
              <Button variant="outline" onClick={() => setOpen(false)}>
                ล้างตัวกรอง
              </Button>
              <Button onClick={() => setOpen(false)}>ดูผลลัพธ์</Button>
            </div>
          </DialogContent>
        </DialogRoot>
      </>
    );
  },
};

/** A long body scrolls on its own, so the header and footer stay put. */
export const ScrollingBody: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <>
        <Button onClick={() => setOpen(true)}>เปิดรายการยาว</Button>
        <DialogRoot open={open} onOpenChange={setOpen}>
          <DialogContent aria-describedby={undefined}>
            <div className="border-border flex items-center justify-between gap-4 border-b px-5 py-4 md:px-6 md:py-5">
              <DialogTitle>สังกัด</DialogTitle>
              <DialogClose aria-label="ปิด" className={closeButtonClass}>
                <X aria-hidden="true" className="size-5" />
              </DialogClose>
            </div>

            <div className="grid flex-1 grid-cols-1 gap-3 overflow-y-auto px-5 py-5 md:grid-cols-2 md:px-6">
              {Array.from({ length: 40 }, (_, index) => (
                <Checkbox key={index} label={`สังกัดที่ ${index + 1}`} />
              ))}
            </div>

            <div className="border-border flex justify-end border-t px-5 py-4 md:px-6">
              <Button onClick={() => setOpen(false)}>ดูผลลัพธ์</Button>
            </div>
          </DialogContent>
        </DialogRoot>
      </>
    );
  },
};

/**
 * `placement="anchored"` drops the panel out of the nearest positioned ancestor instead of
 * floating it over the page — for a filter that belongs to the control that opened it. Pair it
 * with `modal={false}` so the page keeps its scrim-free, scrollable self.
 */
export const Anchored: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <div className="relative w-[420px]">
        <Button className="w-full" onClick={() => setOpen((current) => !current)}>
          เปิดตัวกรอง
        </Button>
        <DialogRoot open={open} onOpenChange={setOpen} modal={false}>
          <DialogContent placement="anchored" aria-describedby={undefined}>
            <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 md:px-6 md:pt-6">
              <DialogTitle className="text-primary">ตัวกรอง</DialogTitle>
              <DialogClose aria-label="ปิด" className={closeButtonClass}>
                <X aria-hidden="true" className="size-5" />
              </DialogClose>
            </div>

            <div className="flex flex-col gap-3 px-5 pb-5 md:px-6">
              {["วิศวกรรมศาสตร์", "อักษรศาสตร์", "นิเทศศาสตร์", "วิทยาศาสตร์"].map((label) => (
                <Checkbox key={label} label={label} />
              ))}
            </div>

            <div className="border-border flex justify-end border-t px-5 py-4 md:px-6">
              <Button onClick={() => setOpen(false)}>ยืนยัน</Button>
            </div>
          </DialogContent>
        </DialogRoot>
      </div>
    );
  },
};
