"use client";

import { X } from "lucide-react";

import { Button, DialogClose, DialogContent, DialogRoot, DialogTitle } from "@/components/ui";
import {
  PostForm,
  type ActivityTypeOption,
  type CategoryOption,
  type FacultyOption,
} from "@/app/(site)/club/dashboard/posts/_components/PostForm";
import { uploadActivityPoster } from "@/app/(site)/club/dashboard/posts/upload/_lib/upload-activity-poster";
import {
  getPosterContentType,
  type CreatePostFormValues,
} from "@/app/(site)/club/dashboard/posts/post-schema";
import { api, type RouterOutputs } from "@/trpc/react";

type Activity = RouterOutputs["activities"]["getMine"]["activities"][number];

const UPDATE_ERROR_MESSAGE = "ไม่สามารถบันทึกการแก้ไขได้ กรุณาลองใหม่อีกครั้ง";

/** The list already carries everything the form prefills — this never triggers a second fetch. */
function toDefaultValues(
  activity: Activity,
  activityTypes: readonly ActivityTypeOption[]
): CreatePostFormValues {
  const activityType = activityTypes.find((type) => type.id === activity.activityTypeId);

  return {
    poster: activity.posterUrl,
    title: activity.title,
    applicationFormUrl: activity.applicationFormUrl,
    applicationStartAt: activity.applicationStartAt,
    applicationEndAt: activity.applicationEndAt,
    activityType: activityType?.label ?? "",
    categoryIds: activity.categories.map((category) => category.id),
    description: activity.description,
    audience: activity.audience,
    yearLevels: activity.yearLevels,
    facultyIds: activity.faculties.map((faculty) => faculty.id),
  };
}

type PostDetailsDialogProps = {
  /** `null` closes the dialog — also drives which post it renders while open. */
  activity: Activity | null;
  activityTypes: readonly ActivityTypeOption[];
  categories: readonly CategoryOption[];
  faculties: readonly FacultyOption[];
  onOpenChange: (open: boolean) => void;
  /** Called after a successful save — the caller re-queries the list and closes the dialog. */
  onUpdated: () => void;
  onDeleteRequest: (activity: Activity) => void;
};

/**
 * Where editing lives for "My Posts". Renders the shared `PostForm` prefilled from the row the
 * list already holds — opening this dialog never fetches anything on its own. Opens directly in
 * edit mode; there is no read-only state.
 */
export function PostDetailsDialog({
  activity,
  activityTypes,
  categories,
  faculties,
  onOpenChange,
  onUpdated,
  onDeleteRequest,
}: PostDetailsDialogProps) {
  const getPosterUploadUrl = api.activities.getPosterUploadUrl.useMutation();
  const deletePoster = api.activities.deletePoster.useMutation();
  const updateActivity = api.activities.update.useMutation();

  const handleSubmit = async (values: CreatePostFormValues) => {
    if (!activity) return;
    if (!values.applicationStartAt || !values.applicationEndAt) {
      throw new Error("Application window is required");
    }
    if (!values.audience) throw new Error("Audience is required");

    const activityType = activityTypes.find((type) => type.label === values.activityType);
    if (!activityType) throw new Error("Selected activity type was not found");

    // `update` rejects a posterUrl outside the club's own upload folder, so a swapped poster
    // always goes through getPosterUploadUrl first — an unchanged one (a string already) is
    // passed straight through instead of being re-uploaded.
    let posterUrl: string;
    let uploadedKey: string | null = null;
    if (typeof values.poster === "string") {
      posterUrl = values.poster;
    } else if (values.poster instanceof File) {
      const contentType = getPosterContentType(values.poster);
      if (!contentType) throw new Error("Unsupported poster image type");

      const posterTarget = await getPosterUploadUrl.mutateAsync({
        contentType,
        contentLength: values.poster.size,
      });
      await uploadActivityPoster(values.poster, { url: posterTarget.url, contentType });
      posterUrl = posterTarget.publicUrl;
      uploadedKey = posterTarget.key;
    } else {
      throw new Error("Poster is required");
    }

    try {
      await updateActivity.mutateAsync({
        id: activity.id,
        title: values.title,
        description: values.description,
        posterUrl,
        applicationFormUrl: values.applicationFormUrl,
        activityTypeId: activityType.id,
        audience: values.audience,
        categoryIds: values.categoryIds,
        facultyIds: values.facultyIds,
        yearLevels: values.yearLevels,
        applicationStartAt: values.applicationStartAt,
        applicationEndAt: values.applicationEndAt,
      });
    } catch (error) {
      // The new poster is already in R2 but no activity references it — clean it up so a retry
      // doesn't leave an orphan, same as the create flow.
      if (uploadedKey) {
        await deletePoster.mutateAsync({ key: uploadedKey }).catch(() => undefined);
      }
      throw error;
    }

    onUpdated();
  };

  return (
    <DialogRoot open={activity !== null} onOpenChange={onOpenChange}>
      <DialogContent
        placement="modal"
        aria-describedby={undefined}
        // `modal` is centered at every breakpoint — the default 400px cap is right for mobile
        // (same centered-panel idiom as `ConfirmModal`), overridden back to the existing 900px
        // from `md` up so desktop is unchanged.
        className="relative w-full md:w-[900px] md:max-w-[900px]"
      >
        {/* Radix requires a DialogTitle for the accessible name — kept, just visually hidden,
            since the visible heading is PostForm's own "ข้อมูลทั่วไป" <h2>. */}
        <DialogTitle className="sr-only">ข้อมูลทั่วไป</DialogTitle>
        <DialogClose
          aria-label="ปิด"
          className="text-placeholder hover:text-foreground focus-visible:ring-primary absolute top-6 right-6 z-10 shrink-0 cursor-pointer rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <X aria-hidden="true" className="size-5" />
        </DialogClose>

        <div className="flex-1 overflow-y-auto px-6 pt-6">
          {activity && (
            <PostForm
              key={activity.id}
              activityTypes={activityTypes}
              categories={categories}
              faculties={faculties}
              defaultValues={toDefaultValues(activity, activityTypes)}
              onSubmit={handleSubmit}
              submitErrorMessage={UPDATE_ERROR_MESSAGE}
              generalSectionAside={
                <span className="font-ibm-plex text-foreground-muted flex items-center gap-1.5 text-sm leading-[23px] font-medium md:text-base md:leading-[26px]">
                  <span aria-hidden="true" className="bg-foreground-muted size-2 rounded-full" />
                  กำลังแก้ไขอยู่
                </span>
              }
              // Sticky (not hoisted out of the form) so it stays inside `PostForm`'s <fieldset> —
              // the `inert`/`aria-busy` blocking during submit keeps covering these buttons for
              // free. `-mx-6` cancels the scrolling container's own `px-6` so the border/background
              // reach the dialog's edges like `ClubFilterModal`'s footer; `rounded-b-xl` matches the
              // dialog panel's own corner radius since this bg now overlaps it.
              footer={({ isSubmitting, isValid }) => (
                <div className="border-border sticky bottom-0 z-10 -mx-6 flex flex-col-reverse gap-4 rounded-b-xl border-t bg-white px-6 py-4 sm:flex-row sm:justify-between sm:py-5">
                  <Button
                    type="button"
                    variant="outline"
                    color="destructive"
                    className="w-full sm:w-[200px]"
                    disabled={isSubmitting}
                    onClick={() => onDeleteRequest(activity)}
                  >
                    ลบโพสต์
                  </Button>
                  <Button
                    type="submit"
                    className="w-full sm:w-[200px]"
                    disabled={isSubmitting || !isValid}
                    isLoading={isSubmitting}
                  >
                    ยืนยัน
                  </Button>
                </div>
              )}
            />
          )}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
