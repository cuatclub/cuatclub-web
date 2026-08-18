import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { User, Users } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "./ToggleGroup";

const meta = {
  title: "UI/ToggleGroup",
  component: ToggleGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "radio",
      options: ["single", "multiple"],
      description: "`single` — at most one item pressed. `multiple` — any number of items pressed.",
    },
    orientation: {
      control: "radio",
      options: ["horizontal", "vertical"],
      description: "Layout axis, and the axis arrow-key navigation follows.",
    },
    disabled: {
      control: "boolean",
      description: "Disables every item in the group at once (distinct from disabling one item).",
    },
  },
  args: {
    type: "single",
    orientation: "horizontal",
  },
} satisfies Meta<typeof ToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single-select — at most one item pressed at a time. This is what the
 * club-registration page (#92) uses for its account-type selector. */
export const Single: Story = {
  args: {
    type: "single",
    defaultValue: "club",
  },
  render: (args) => (
    <ToggleGroup {...args} className="w-80">
      <ToggleGroupItem value="student" className="flex-1">
        <User aria-hidden="true" />
        นักศึกษา
      </ToggleGroupItem>
      <ToggleGroupItem value="club" className="flex-1">
        <Users aria-hidden="true" />
        ชมรม
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** Multi-select — any number of items can be pressed at once; `defaultValue`
 * takes an array instead of a single string. */
export const Multiple: Story = {
  args: {
    type: "multiple",
    defaultValue: ["student", "club"],
  },
  render: (args) => (
    <ToggleGroup {...args} className="w-80">
      <ToggleGroupItem value="student" className="flex-1">
        <User aria-hidden="true" />
        นักศึกษา
      </ToggleGroupItem>
      <ToggleGroupItem value="club" className="flex-1">
        <Users aria-hidden="true" />
        ชมรม
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** One item disabled — matches the club-registration page (#92), where
 * Student is shown per design but permanently non-functional. Distinct from
 * disabling the whole group: the other item stays fully interactive. */
export const OneItemDisabled: Story = {
  args: {
    type: "single",
    defaultValue: "club",
  },
  render: (args) => (
    <ToggleGroup {...args} className="w-80">
      <ToggleGroupItem value="student" disabled className="flex-1">
        <User aria-hidden="true" />
        นักศึกษา
      </ToggleGroupItem>
      <ToggleGroupItem value="club" className="flex-1">
        <Users aria-hidden="true" />
        ชมรม
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** The `disabled` prop on ToggleGroup itself disables every item at once —
 * use this over disabling each ToggleGroupItem individually. */
export const GroupDisabled: Story = {
  args: {
    type: "single",
    defaultValue: "club",
    disabled: true,
  },
  render: (args) => (
    <ToggleGroup {...args} className="w-80">
      <ToggleGroupItem value="student" className="flex-1">
        <User aria-hidden="true" />
        นักศึกษา
      </ToggleGroupItem>
      <ToggleGroupItem value="club" className="flex-1">
        <Users aria-hidden="true" />
        ชมรม
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** Vertical orientation — items stack top-to-bottom and share top/bottom
 * borders instead of left/right; arrow-key navigation follows the same
 * axis (Up/Down instead of Left/Right). */
export const Vertical: Story = {
  args: {
    type: "single",
    defaultValue: "club",
    orientation: "vertical",
  },
  render: (args) => (
    <ToggleGroup {...args} className="w-48">
      <ToggleGroupItem value="student">
        <User aria-hidden="true" />
        นักศึกษา
      </ToggleGroupItem>
      <ToggleGroupItem value="club">
        <Users aria-hidden="true" />
        ชมรม
      </ToggleGroupItem>
    </ToggleGroup>
  ),
};

/** Controlled — the parent owns `value` and can veto changes. Here an empty
 * next-value (Radix's single-select fires this when you click the already-
 * pressed item) is ignored, so exactly one item always stays pressed — the
 * same guard the register page uses since Student is disabled anyway and
 * there's never a valid "nothing selected" state. */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("club");
    return (
      <ToggleGroup
        type="single"
        value={value}
        onValueChange={(next) => next && setValue(next)}
        className="w-80"
      >
        <ToggleGroupItem value="student" className="flex-1">
          <User aria-hidden="true" />
          นักศึกษา
        </ToggleGroupItem>
        <ToggleGroupItem value="club" className="flex-1">
          <Users aria-hidden="true" />
          ชมรม
        </ToggleGroupItem>
      </ToggleGroup>
    );
  },
};
