import { Fragment, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { Pagination } from "./Pagination";

const meta = {
  title: "UI/Pagination",
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  args: {
    page: 1,
    totalPages: 12,
    onPageChange: fn(),
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Click through the pages — the run always keeps the first, the last, and a neighbour either side. */
export const Default: Story = {
  render: (args) => {
    const [page, setPage] = useState(1);
    return <Pagination {...args} page={page} onPageChange={setPage} />;
  },
};

/** Few enough pages to list them all, so no "…" and no page is ever hidden. */
export const FewPages: Story = {
  args: {
    totalPages: 4,
    page: 2,
  },
};

/** On the first page there is nowhere to go back to. */
export const FirstPage: Story = {
  args: {
    page: 1,
  },
};

/** Deep in the run, the current page keeps a neighbour on either side. */
export const MiddlePage: Story = {
  args: {
    page: 6,
  },
};

/** The last page mirrors the first — one neighbour back, and a dead "next". */
export const LastPage: Story = {
  args: {
    page: 12,
  },
};

/** One page of results needs no control at all, so nothing renders. */
export const SinglePage: Story = {
  args: {
    totalPages: 1,
  },
};

export const AllStates: Story = {
  parameters: {
    layout: "fullscreen",
  },
  render: () => {
    const rows: { label: string; page: number; totalPages: number }[] = [
      { label: "Four pages", page: 2, totalPages: 4 },
      { label: "First page", page: 1, totalPages: 12 },
      { label: "Near the start", page: 3, totalPages: 12 },
      { label: "Middle", page: 6, totalPages: 12 },
      { label: "Near the end", page: 10, totalPages: 12 },
      { label: "Last page", page: 12, totalPages: 12 },
    ];

    return (
      <div className="grid grid-cols-[140px_auto] items-center gap-x-12 gap-y-6 p-10">
        {rows.map((row) => (
          <Fragment key={row.label}>
            <div className="text-foreground-secondary text-sm">{row.label}</div>
            <Pagination page={row.page} totalPages={row.totalPages} onPageChange={fn()} />
          </Fragment>
        ))}
      </div>
    );
  },
};
