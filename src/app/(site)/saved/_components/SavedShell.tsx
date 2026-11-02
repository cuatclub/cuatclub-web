import { Bookmark } from "lucide-react";

import { BackLink } from "@/app/(site)/activities/[activityId]/_components";

type SavedShellProps = {
  children: React.ReactNode;
};

/**
 * The frame around the saved list — back link, heading, and the column the list sits in. The page
 * and its `loading.tsx` both render it, so the heading stays put when the real page replaces it.
 */
export function SavedShell({ children }: SavedShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-[1512px] flex-col gap-6 px-5 pt-5 pb-8 md:gap-8 md:px-8 md:pt-10 md:pb-16 xl:px-25">
      <BackLink />

      <h1 className="font-ibm-plex text-primary flex items-center gap-2 text-2xl leading-[normal] font-bold md:text-[32px]">
        <Bookmark aria-hidden="true" className="size-6 shrink-0 md:size-8" />
        ที่บันทึกไว้
      </h1>

      {children}
    </main>
  );
}
