import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { LogOut } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./DropdownMenu";

const meta = {
  title: "UI/DropdownMenu",
  component: DropdownMenu,
  parameters: {
    layout: "centered",
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ProfileMenu: Story = {
  render: () => (
    <DropdownMenu defaultOpen>
      <DropdownMenuTrigger
        type="button"
        className="font-ibm-plex text-foreground rounded-full border px-4 py-2 text-sm"
      >
        เมนูผู้ใช้
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <div className="flex flex-col pb-2">
          <span className="font-ibm-plex text-foreground text-sm font-semibold">John Doe</span>
          <span className="font-ibm-plex text-foreground-secondary text-xs">example@gmail.com</span>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-foreground-secondary hover:text-error data-[highlighted]:text-error">
          <LogOut className="h-4 w-4" />
          ออกจากระบบ
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};
