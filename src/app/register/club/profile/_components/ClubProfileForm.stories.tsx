import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { ClubProfileForm } from "@/app/register/club/profile/_components/ClubProfileForm";
import { MOCK_AFFILIATIONS, MOCK_CATEGORIES } from "@/app/register/club/profile/profile-mock-data";
import {
  CLUB_NAME_REQUIRED_MESSAGE,
  type ClubProfileFormValues,
} from "@/app/register/club/profile/profile-schema";

const BLANK_INITIAL_VALUES: ClubProfileFormValues = {
  logo: null,
  name: "",
  affiliation: "",
  categories: [],
  shortDescription: "",
  longDescription: "",
  atmospherePhotos: [],
  contacts: { instagram: "", facebook: "", tiktok: "", lineOa: "" },
};

const PREFILLED_INITIAL_VALUES: ClubProfileFormValues = {
  logo: {
    kind: "persisted",
    url: "https://placehold.co/320x320/DD598C/FFFFFF/png?text=Club",
  },
  name: "Thinc.",
  affiliation: MOCK_AFFILIATIONS[3],
  categories: [MOCK_CATEGORIES[3], MOCK_CATEGORIES[4]],
  shortDescription: "ชมรมสำหรับคนที่สนใจเทคโนโลยี",
  longDescription: "พื้นที่เรียนรู้และสร้างโครงการร่วมกันของนิสิต",
  atmospherePhotos: [
    {
      kind: "persisted",
      url: "https://placehold.co/640x640/0891B2/FFFFFF/png?text=Club+1",
    },
    {
      kind: "persisted",
      url: "https://placehold.co/640x640/9333EA/FFFFFF/png?text=Club+2",
    },
  ],
  contacts: {
    instagram: "thinc.th",
    facebook: "Thinc.",
    tiktok: "",
    lineOa: "@thinc.th",
  },
};

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
    initialValues: BLANK_INITIAL_VALUES,
    onSubmit: async () => undefined,
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

export const Prefilled: Story = {
  args: { initialValues: PREFILLED_INITIAL_VALUES },
};
