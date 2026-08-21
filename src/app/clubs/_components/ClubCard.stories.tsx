import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ClubCard } from "./ClubCard";

const categories = [
  { id: 1, label: "เทคโนโลยี", fontColor: "#0891b2", backgroundColor: "#cffafe" },
  { id: 2, label: "ธุรกิจ", fontColor: "#9333ea", backgroundColor: "#f3e8ff" },
  { id: 3, label: "กีฬา", fontColor: "#db2777", backgroundColor: "#fce7f3" },
];

const meta = {
  title: "Clubs/ClubCard",
  component: ClubCard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[400px]">
        <Story />
      </div>
    ),
  ],
  args: {
    id: "11111111-1111-1111-1111-111111111111",
    name: "Thinc.",
    logoUrl: "https://placehold.co/56x56/png",
    shortDescription:
      "Thinc. is a student-run builder community committed to developing hidden talent into people who create real-world impact through software, product, and startup-style execution.",
    affiliation: { id: 1, label: "วิศวกรรมศาสตร์" },
    categories: categories.slice(0, 2),
  },
} satisfies Meta<typeof ClubCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

/** No logo uploaded — the card falls back to the club's initial. */
export const WithoutLogo: Story = {
  args: {
    logoUrl: null,
  },
};

/** Clubs that haven't filled in a description or picked an affiliation still render cleanly. */
export const Minimal: Story = {
  args: {
    name: "ชมรมถ่ายภาพ",
    logoUrl: null,
    shortDescription: null,
    affiliation: null,
    categories: [],
  },
};

/** Only the first two categories fit beside the logo; the rest are dropped. */
export const ManyCategories: Story = {
  args: {
    categories,
  },
};

/** Long names and affiliations truncate rather than pushing the layout around. */
export const LongText: Story = {
  args: {
    name: "ชมรมพัฒนาซอฟต์แวร์และนวัตกรรมดิจิทัลแห่งจุฬาลงกรณ์มหาวิทยาลัย",
    affiliation: { id: 2, label: "คณะวิทยาศาสตร์และเทคโนโลยีสารสนเทศ" },
  },
};

/** Cards in a row share a height, so their footers line up regardless of description length. */
export const InGrid: Story = {
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="grid max-w-[1248px] grid-cols-3 gap-6 p-10">
        <Story />
      </div>
    ),
  ],
  render: (args) => (
    <>
      <ClubCard {...args} />
      <ClubCard {...args} id="2" name="ชมรมดนตรีสากล" shortDescription="วงดนตรีของนิสิตจุฬาฯ" />
      <ClubCard {...args} id="3" name="ชมรมอาสาพัฒนา" logoUrl={null} />
    </>
  ),
};
