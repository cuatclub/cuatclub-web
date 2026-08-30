import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Navbar } from "./Navbar";

const meta = {
  title: "Components/Navbar",
  component: Navbar,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof Navbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedOut: Story = {
  args: {
    isLoggedIn: false,
  },
};

export const LoggedIn: Story = {
  args: {
    isLoggedIn: true,
    userName: "John Doe",
    userEmail: "example@gmail.com",
    userRole: "CLUB",
    userImage: "https://placehold.co/80x80",
  },
};

export const LoggedInStudent: Story = {
  args: {
    isLoggedIn: true,
    userName: "John Doe",
    userEmail: "example@gmail.com",
    userRole: "STUDENT",
  },
};

export const Mobile: Story = {
  args: {
    isLoggedIn: false,
  },
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};
