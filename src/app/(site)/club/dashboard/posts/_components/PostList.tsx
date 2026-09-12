"use client";

import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { keepPreviousData } from "@tanstack/react-query";

import { PostCard } from "@/app/(site)/club/dashboard/posts/_components/PostCard";
import { PostDetailsDialog } from "@/app/(site)/club/dashboard/posts/_components/PostDetailsDialog";
import { PostSearchBar } from "@/app/(site)/club/dashboard/posts/_components/PostSearchBar";
import { PostSortSelect } from "@/app/(site)/club/dashboard/posts/_components/PostSortSelect";
import { PostSupportCard } from "@/app/(site)/club/dashboard/posts/_components/PostSupportCard";
import {
  buildPostListQuery,
  parsePostListParams,
  toPostsQueryInput,
  type PostListParams,
} from "@/app/(site)/club/dashboard/posts/_lib/post-list-params";
import { ConfirmModal } from "@/components";
import { api, type RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getMine"]["activities"][number];

type PostListProps = {
  clubName: string;
  clubAvatarUrl: string;
};

/**
 * The greeting is a block element inside the left column (not the full-width row above it) so
 * it sizes to the 792px list column, and the rail's top edge — a sibling with `items-start` —
 * lines up with the greeting's own top instead of the search row below it.
 */
function Greeting({ clubName }: { clubName: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="font-ibm-plex text-primary text-[28px] leading-[38px] font-bold">
        👋 ยินดีต้อนรับ {clubName}
      </h1>
      <p className="font-ibm-plex text-foreground-secondary text-base font-medium">
        จัดการและติดตามโพสต์ทั้งหมดของคุณได้ที่นี่
      </p>
    </div>
  );
}

/**
 * The interactive half of "My Posts". Every control writes to the URL and the list reads back
 * from it, so there is one source of truth and a filtered view is always a shareable link —
 * mirrors `ClubList`'s own approach on the public club listing.
 */
export function PostList({ clubName, clubAvatarUrl }: PostListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const utils = api.useUtils();

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);

  const params = parsePostListParams(searchParams);

  const { data, isPending, isError } = api.activities.getMine.useQuery(toPostsQueryInput(params), {
    // Keep the previous list on screen while the next one loads, so changing sort or search
    // doesn't flash the list to empty.
    placeholderData: keepPreviousData,
  });
  const { data: activityTypes } = api.masterData.activityTypes.getAll.useQuery({});
  const { data: categories } = api.masterData.categories.getAll.useQuery({});
  const { data: faculties } = api.masterData.faculties.getAll.useQuery({});

  const deleteActivity = api.activities.delete.useMutation();

  const updateParams = (patch: Partial<PostListParams>) => {
    const next = { ...params, ...patch };
    router.push(`${pathname}${buildPostListQuery(next)}`, { scroll: false });
  };

  const refreshList = () => utils.activities.getMine.invalidate();

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    await deleteActivity.mutateAsync({ id: deleteTarget.id });
    await refreshList();
    // Deleting from inside the details dialog should close it along with the confirmation.
    if (selectedActivity?.id === deleteTarget.id) setSelectedActivity(null);
    setDeleteTarget(null);
  };

  const activities = data?.activities ?? [];

  return (
    // Asymmetric padding (40px left / 100px right at md+) is applied here rather than in
    // `DashboardShell`, whose `<main>` already contributes the symmetric 40px both pages share —
    // this row only adds the extra 60px of right padding "My Posts" needs to land its list
    // column at 792px, and the other dashboard pages that share the shell stay untouched.
    <div className="flex flex-col gap-6 md:flex-row md:items-start md:gap-6 md:pr-[60px]">
      <div className="flex min-w-0 flex-1 flex-col gap-6 md:gap-9">
        <Greeting clubName={clubName} />

        <div className="flex flex-col gap-6 md:gap-8">
          {/* One row at every breakpoint — Figma's mobile frame sits search and sort side by
              side, not stacked; only the sort's width grows at md+ (see PostSortSelect). */}
          <div className="flex flex-row items-center gap-3">
            <PostSearchBar
              // Remounts the field when the applied term changes elsewhere — the back button.
              key={params.search}
              defaultValue={params.search}
              onSearch={(search) => updateParams({ search })}
              className="min-w-0 flex-1"
            />
            <PostSortSelect value={params.sort} onValueChange={(sort) => updateParams({ sort })} />
          </div>

          {isPending ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }, (_, index) => (
                <PostCardSkeleton key={index} />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <p className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold md:text-lg md:leading-[30px]">
                โหลดโพสต์ไม่สำเร็จ
              </p>
              <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px] md:text-base md:leading-[26px]">
                กรุณาลองใหม่อีกครั้ง
              </p>
            </div>
          ) : activities.length === 0 ? (
            params.search ? (
              <PostListMessage
                heading="ไม่พบโพสต์ที่ตรงกับคำค้นหา"
                subtitle="ลองใช้คำค้นหาอื่นอีกครั้ง"
              />
            ) : (
              <PostListMessage
                heading="ยังไม่มีโพสต์"
                subtitle="โพสต์ที่คุณสร้างจะแสดงอยู่ที่นี่"
              />
            )
          ) : (
            <div className="flex flex-col gap-4">
              {activities.map((activity) => (
                <PostCard
                  key={activity.id}
                  activity={activity}
                  activityTypes={activityTypes ?? []}
                  totalFacultyCount={faculties?.length ?? 0}
                  clubName={clubName}
                  clubAvatarUrl={clubAvatarUrl}
                  onOpen={() => setSelectedActivity(activity)}
                  onDeleteRequest={() => setDeleteTarget(activity)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Figma's mobile frame has no support card at all — hidden below `md`, not reflowed to
          the top. From `md` up it sticks under the navbar (mirrors `DashboardSidebar`'s own
          `md:sticky md:top-16`) so it stays visible while the list scrolls; `top-20` (80px)
          adds a 16px gap under the fixed 64px navbar instead of sitting flush against it. */}
      <PostSupportCard className="hidden shrink-0 md:sticky md:top-20 md:block md:w-[300px]" />

      <PostDetailsDialog
        activity={selectedActivity}
        activityTypes={activityTypes ?? []}
        categories={categories ?? []}
        faculties={faculties ?? []}
        onOpenChange={(open) => !open && setSelectedActivity(null)}
        onUpdated={() => {
          void refreshList();
          setSelectedActivity(null);
        }}
        onDeleteRequest={(activity) => setDeleteTarget(activity)}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="ลบโพสต์"
        description="คุณต้องการลบโพสต์นี้ใช่หรือไม่"
        isLoading={deleteActivity.isPending}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  );
}

/** Mirrors the card's own shape so the list doesn't resize once the real results arrive. */
function PostCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="border-border flex gap-4 rounded-xl border bg-white p-4 md:gap-5 md:p-6"
    >
      <div className="bg-surface aspect-[3/4] w-[100px] shrink-0 animate-pulse rounded-xl md:aspect-auto md:h-[262px] md:w-[205px]" />
      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-center gap-2">
          <div className="bg-surface size-7 shrink-0 animate-pulse rounded-full" />
          <div className="bg-surface h-4 w-24 animate-pulse rounded" />
        </div>
        <div className="bg-surface h-6 w-7/12 animate-pulse rounded" />
        <div className="bg-surface h-4 w-full animate-pulse rounded" />
        <div className="bg-surface h-4 w-3/4 animate-pulse rounded" />
      </div>
    </div>
  );
}

type PostListMessageProps = {
  heading: string;
  subtitle: string;
};

/**
 * Shared by the "no posts at all" and "search matched nothing" states — same illustration,
 * sizing and layout, only the two lines of text differ, so the two states can't drift apart.
 */
function PostListMessage({ heading, subtitle }: PostListMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <Image
        src="/svg/no-post.svg"
        alt=""
        width={220}
        height={211}
        className="h-[176px] w-[184px] md:h-[211px] md:w-[220px]"
      />
      <p className="font-ibm-plex text-primary text-base leading-[26px] font-bold md:text-lg md:leading-[30px]">
        {heading}
      </p>
      <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px] md:text-base md:leading-[26px]">
        {subtitle}
      </p>
    </div>
  );
}
