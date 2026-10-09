"use client";

import { useRef, useState } from "react";
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
import { ConfirmModal, toast } from "@/components";
import { api, type RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getMine"]["activities"][number];

type PostListProps = {
  clubName: string;
  clubAvatarUrl: string;
};

/** Inside the list column (not above the row) so the rail's top aligns with the greeting. */
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

export function PostList({ clubName, clubAvatarUrl }: PostListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const utils = api.useUtils();

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Activity | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  // The edit button that opened the details dialog, so closing it can hand focus back there.
  const editTriggerRef = useRef<HTMLButtonElement | null>(null);

  const params = parsePostListParams(searchParams);

  const { data, isPending, isError } = api.activities.getMine.useQuery(toPostsQueryInput(params), {
    placeholderData: keepPreviousData,
  });
  const { data: activityTypes } = api.masterData.activityTypes.getAll.useQuery({});
  const { data: categories } = api.masterData.categories.getAll.useQuery({});
  const { data: faculties } = api.masterData.faculties.getAll.useQuery({});

  const deleteActivity = api.activities.delete.useMutation();

  // Search replaces the history entry — it fires as the visitor types, and a back-button stop per
  // pause would bury the page they came from. Sort is a deliberate choice, so it pushes.
  const updateParams = (patch: Partial<PostListParams>, { replace = false } = {}) => {
    const next = { ...params, ...patch };
    const url = `${pathname}${buildPostListQuery(next)}`;
    if (replace) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  };

  const refreshList = () => utils.activities.getMine.invalidate();

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteActivity.mutateAsync({ id: deleteTarget.id });
    } catch {
      setDeleteError("ไม่สามารถลบโพสต์ได้ กรุณาลองอีกครั้ง");
      return;
    }
    toast.success("ลบโพสต์เรียบร้อย");
    await refreshList();
    if (selectedActivity?.id === deleteTarget.id) setSelectedActivity(null);
    setDeleteTarget(null);
  };

  const activities = data?.activities ?? [];

  return (
    // `xl:pr-[60px]` adds to <main>'s 40px padding to land the list column at 792px. The rail only
    // sits beside the list from xl; below that it leaves no room for a readable post column.
    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:gap-6 xl:pr-[60px]">
      <div className="flex min-w-0 flex-1 flex-col gap-6 md:gap-9">
        <Greeting clubName={clubName} />

        <div className="flex flex-col gap-6 md:gap-8">
          <div className="flex flex-row items-center gap-3">
            <PostSearchBar
              defaultValue={params.search}
              onSearch={(search) => updateParams({ search }, { replace: true })}
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
                  onEditRequest={(trigger) => {
                    editTriggerRef.current = trigger;
                    setSelectedActivity(activity);
                  }}
                  onDeleteRequest={() => setDeleteTarget(activity)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden below xl. The rail stretches the row and `-mb-20` extends it through <main>'s 80px
          bottom padding, so its bounds match DashboardSidebar's. The inner box sticks at the
          card's resting spot (`top-26` = 64px navbar + 40px <main> padding) and runs to the
          viewport's bottom edge, so the card leaves the viewport at the same scroll position as
          the sidebar instead of staying pinned. */}
      <div className="hidden shrink-0 xl:-mb-20 xl:block xl:self-stretch">
        <div className="xl:sticky xl:top-26 xl:h-[calc(100vh-6.5rem)]">
          <PostSupportCard className="xl:flex xl:w-[300px]" />
        </div>
      </div>

      <PostDetailsDialog
        activity={selectedActivity}
        activityTypes={activityTypes ?? []}
        categories={categories ?? []}
        faculties={faculties ?? []}
        returnFocusRef={editTriggerRef}
        onOpenChange={(open) => !open && setSelectedActivity(null)}
        onUpdated={() => {
          void refreshList();
          setSelectedActivity(null);
        }}
        onDeleteRequest={(activity) => {
          setDeleteError(null);
          setDeleteTarget(activity);
        }}
      />

      <ConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteError(null);
            setDeleteTarget(null);
          }
        }}
        title="ลบโพสต์"
        description={deleteError ?? "คุณต้องการลบโพสต์นี้ใช่หรือไม่"}
        isLoading={deleteActivity.isPending}
        onConfirm={() => void handleDeleteConfirm()}
      />
    </div>
  );
}

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

function PostListMessage({ heading, subtitle }: PostListMessageProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center md:pt-28">
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
