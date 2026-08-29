import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ClubRegistrationReview } from "@/app/register/club/review/_components/ClubRegistrationReview";
import { Button } from "@/components/ui/Button";

import type { ClubDetailOutputDTO } from "@/server/api/modules/clubs/dto";

export const MOCK_CLUB_REGISTRATION_REVIEW = {
  id: "00000000-0000-4000-8000-000000000001",
  name: "Thinc.",
  logoUrl: "https://placehold.co/200x200/DD598C/FFFFFF/png?text=Thinc.",
  affiliation: { id: 1, label: "วิศวกรรมศาสตร์" },
  categories: [
    { id: 1, label: "เทคโนโลยี", fontColor: "#0891B2", backgroundColor: "#CFFAFE" },
    { id: 2, label: "ธุรกิจ", fontColor: "#9333EA", backgroundColor: "#F3E8FF" },
  ],
  shortDescription: "A concise mock club description.",
  longDescription:
    "A longer multi-sentence mock description used to verify wrapping and spacing. It gives prospective members a clearer picture of the club's activities and community.",
  imageUrls: [
    "https://placehold.co/800x600/DD598C/FFFFFF/png?text=Thinc+1",
    "https://placehold.co/800x600/0891B2/FFFFFF/png?text=Thinc+2",
    "https://placehold.co/800x600/9333EA/FFFFFF/png?text=Thinc+3",
    "https://placehold.co/800x600/EA580C/FFFFFF/png?text=Thinc+4",
    "https://placehold.co/800x600/16A34A/FFFFFF/png?text=Thinc+5",
  ],
  contacts: {
    instagram: "thinc.th",
    facebook: "Thinc.",
    tiktok: "Thinc.",
    line_oa: "@thinc.th",
  },
} satisfies ClubDetailOutputDTO;

export const MOCK_CLUB_REGISTRATION_REVIEW_WITHOUT_OPTIONAL_DATA = {
  ...MOCK_CLUB_REGISTRATION_REVIEW,
  logoUrl: null,
  affiliation: null,
  imageUrls: [],
  contacts: null,
} satisfies ClubDetailOutputDTO;

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
