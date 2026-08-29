import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { ClubProfileForm } from "@/app/register/club/profile/_components/ClubProfileForm";
import { MOCK_AFFILIATIONS, MOCK_CATEGORIES } from "@/app/register/club/profile/profile-mock-data";
import { CLUB_NAME_REQUIRED_MESSAGE } from "@/app/register/club/profile/profile-schema";

const meta = {
  title: "Registration/ClubProfileForm",
  component: ClubProfileForm,
  parameters: {
    layout: "fullscreen",
    nextjs: {
      appDirectory: true,
    },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen justify-center bg-white px-5 py-8">
        <Story />
      </div>
    ),
  ],
  args: {
    affiliations: MOCK_AFFILIATIONS,
    categories: MOCK_CATEGORIES,
  },
} satisfies Meta<typeof ClubProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "ถัดไป" })).toBeDisabled();

    const clubName = canvas.getByLabelText(/ชื่อชมรม/);
    await userEvent.click(clubName);
    await userEvent.tab();

    await expect(await canvas.findByText(CLUB_NAME_REQUIRED_MESSAGE)).toBeVisible();
  },
};
