import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./Card";
import { Button } from "./Button";
import { Input } from "./Input";
import { Tag } from "./Tag";

const meta = {
  title: "UI/Card",
  component: Card,
  subcomponents: {
    CardHeader,
    CardTitle,
    CardDescription,
    CardAction,
    CardContent,
    CardFooter,
  },
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Header + content. The smallest useful card. */
export const Default: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>ชมรมถ่ายภาพ</CardTitle>
        <CardDescription>รับสมัครสมาชิกใหม่ ปีการศึกษา 2568</CardDescription>
      </CardHeader>
      <CardContent className="text-foreground-secondary text-sm">
        กิจกรรมทุกวันพุธ เวลา 17.00 น. ณ ตึกกิจกรรมนิสิต ไม่จำเป็นต้องมีกล้องเป็นของตัวเอง
      </CardContent>
    </Card>
  ),
};

/** `CardAction` docks to the top-right of the header, spanning both title rows. */
export const WithAction: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader>
        <CardTitle>ชมรมดนตรีสากล</CardTitle>
        <CardDescription>เปิดรับสมัครถึง 30 กันยายน</CardDescription>
        <CardAction>
          <Button variant="outline">สมัคร</Button>
        </CardAction>
      </CardHeader>
      <CardContent className="text-foreground-secondary text-sm">
        ซ้อมรวมวงทุกวันศุกร์ เปิดรับทุกเครื่องดนตรี
      </CardContent>
    </Card>
  ),
};

/** Add `border-b` / `border-t` to the header or footer to get divider padding for free. */
export const WithFooter: Story = {
  render: () => (
    <Card className="w-[360px]">
      <CardHeader className="border-border border-b">
        <CardTitle>ชมรมอาสาพัฒนา</CardTitle>
        <CardDescription>ค่ายอาสา 3 วัน 2 คืน</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Tag color="var(--tag-green)" bgColor="var(--tag-green-light)">
          อาสาสมัคร
        </Tag>
        <Tag color="var(--tag-blue)" bgColor="var(--tag-blue-light)">
          ค่าย
        </Tag>
      </CardContent>
      <CardFooter className="border-border justify-end gap-3 border-t">
        <Button variant="outline">รายละเอียด</Button>
        <Button>สมัครเลย</Button>
      </CardFooter>
    </Card>
  ),
};

/** A card wrapping a form — the layout the login page uses. */
export const AsFormContainer: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>เข้าสู่ระบบ</CardTitle>
        <CardDescription>ใช้อีเมลจุฬาฯ ของคุณเพื่อเข้าสู่ระบบ</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input label="อีเมล" type="email" placeholder="student@student.chula.ac.th" />
        <Input label="รหัสผ่าน" type="password" placeholder="••••••••" />
      </CardContent>
      <CardFooter>
        <Button className="w-full">เข้าสู่ระบบ</Button>
      </CardFooter>
    </Card>
  ),
};

/** Every slot labelled, for reviewing spacing and hierarchy in one shot. */
export const Anatomy: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => (
    <div className="flex flex-wrap items-start gap-10 p-10">
      {[
        { label: "Header only", footer: false, action: false },
        { label: "Header + action", footer: false, action: true },
        { label: "Header + footer", footer: true, action: false },
      ].map((variant) => (
        <div key={variant.label} className="flex shrink-0 flex-col gap-3">
          <div className="text-foreground-muted text-sm">{variant.label}</div>
          <Card className="w-[320px]">
            <CardHeader>
              <CardTitle>CardTitle</CardTitle>
              <CardDescription>CardDescription</CardDescription>
              {variant.action && (
                <CardAction>
                  <Button variant="outline">Action</Button>
                </CardAction>
              )}
            </CardHeader>
            <CardContent className="text-foreground-secondary text-sm">CardContent</CardContent>
            {variant.footer && (
              <CardFooter className="justify-end">
                <Button>CardFooter</Button>
              </CardFooter>
            )}
          </Card>
        </div>
      ))}
    </div>
  ),
};
