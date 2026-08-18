import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "./ButtonGroup";
import { Button } from "./Button";

const meta = {
  title: "UI/ButtonGroup",
  component: ButtonGroup,
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
} satisfies Meta<typeof ButtonGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">ย้อนกลับ</Button>
      <Button variant="outline">ถัดไป</Button>
      <Button variant="outline">ยืนยัน</Button>
    </ButtonGroup>
  ),
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="outline">ย้อนกลับ</Button>
      <Button variant="outline">ถัดไป</Button>
      <Button variant="outline">ยืนยัน</Button>
    </ButtonGroup>
  ),
};

export const WithLabelAndSeparator: Story = {
  render: () => (
    <ButtonGroup>
      <ButtonGroupText>หน้า 1 / 3</ButtonGroupText>
      <ButtonGroupSeparator />
      <Button variant="outline">ย้อนกลับ</Button>
      <Button variant="outline">ถัดไป</Button>
    </ButtonGroup>
  ),
};
