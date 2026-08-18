import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bold } from "lucide-react";
import { Toggle } from "./Toggle";

const meta = {
  title: "UI/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    pressed: {
      control: "boolean",
      description: "Controlled pressed state — pass alongside `onPressedChange`.",
    },
    defaultPressed: {
      control: "boolean",
      description: "Uncontrolled initial pressed state.",
    },
    disabled: {
      control: "boolean",
    },
  },
  args: {
    "aria-label": "ตัวหนา",
    children: <Bold aria-hidden="true" />,
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Uncontrolled, starts unpressed — click toggles it freely. */
export const Off: Story = {};

/** Uncontrolled, starts pressed. */
export const On: Story = {
  args: {
    defaultPressed: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

/** Controlled via `pressed` + `onPressedChange` — same wiring ToggleGroup
 * uses internally for each item, exposed here on a single standalone toggle. */
export const Controlled: Story = {
  render: (args) => {
    const [pressed, setPressed] = useState(false);
    return <Toggle {...args} pressed={pressed} onPressedChange={setPressed} />;
  },
};
