import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ClubRegistrationReview } from "@/app/register/club/review/_components/ClubRegistrationReview";
import {
  MOCK_CLUB_REGISTRATION_REVIEW,
  MOCK_CLUB_REGISTRATION_REVIEW_WITHOUT_OPTIONAL_DATA,
} from "@/app/register/club/review/review-mock-data";
import { Button } from "@/components/ui/Button";

const VisualActions = () => (
  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
    <Button type="button" variant="outline" className="w-full sm:w-1/4">
      ย้อนกลับ
    </Button>
    <Button type="button" className="w-full sm:w-1/4">
      ยืนยัน
    </Button>
  </div>
);

const meta = {
  title: "Registration/ClubRegistrationReview",
  component: ClubRegistrationReview,
  parameters: {
    layout: "fullscreen",
    nextjs: { appDirectory: true },
  },
  decorators: [
    (Story) => (
      <div className="flex min-h-screen justify-center bg-white px-5 py-8">
        <Story />
      </div>
    ),
  ],
  args: {
    club: MOCK_CLUB_REGISTRATION_REVIEW,
    actions: <VisualActions />,
  },
} satisfies Meta<typeof ClubRegistrationReview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutOptionalData: Story = {
  args: { club: MOCK_CLUB_REGISTRATION_REVIEW_WITHOUT_OPTIONAL_DATA },
};
