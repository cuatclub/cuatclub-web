"use client";

import { useRouter } from "next/navigation";

import { api } from "@/trpc/react";
import {
  CreatePostForm,
  type ActivityTypeOption,
  type CategoryOption,
  type FacultyOption,
} from "@/app/(site)/club/dashboard/posts/upload/_components/CreatePostForm";
import { uploadActivityPoster } from "@/app/(site)/club/dashboard/posts/upload/_lib/upload-activity-poster";
import {
  getPosterContentType,
  type CreatePostFormValues,
} from "@/app/(site)/club/dashboard/posts/post-schema";

type CreatePostFormContainerProps = {
  activityTypes: ActivityTypeOption[];
  categories: CategoryOption[];
  faculties: FacultyOption[];
};

export function CreatePostFormContainer({
  activityTypes,
  categories,
  faculties,
}: CreatePostFormContainerProps) {
  const router = useRouter();
  const getPosterUploadUrl = api.activities.getPosterUploadUrl.useMutation();
  const deletePoster = api.activities.deletePoster.useMutation();
  const createActivity = api.activities.create.useMutation();

  const handleSubmit = async (values: CreatePostFormValues) => {
    // The schema guarantees these are set by the time submit runs; narrow for TS.
    if (!values.poster) throw new Error("Poster is required");
    // This page only ever creates a post, so `poster` (widened to also allow an existing
    // poster's URL for the edit case elsewhere) is always a freshly picked File here.
    if (typeof values.poster === "string") {
      throw new Error("Poster must be a newly uploaded file");
    }
    if (!values.applicationStartAt || !values.applicationEndAt) {
      throw new Error("Application window is required");
    }
    if (!values.audience) throw new Error("Audience is required");

    const activityType = activityTypes.find((type) => type.label === values.activityType);
    if (!activityType) throw new Error("Selected activity type was not found");

    const contentType = getPosterContentType(values.poster);
    if (!contentType) throw new Error("Unsupported poster image type");

    const posterTarget = await getPosterUploadUrl.mutateAsync({
      contentType,
      contentLength: values.poster.size,
    });
    await uploadActivityPoster(values.poster, { url: posterTarget.url, contentType });

    try {
      await createActivity.mutateAsync({
        title: values.title,
        description: values.description,
        posterUrl: posterTarget.publicUrl,
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
      // The poster is already in R2 but no activity references it — clean it up
      // so a retry doesn't leave an orphan. Swallow any delete failure; the
      // original create error is what the user needs to see.
      await deletePoster.mutateAsync({ key: posterTarget.key }).catch(() => undefined);
      throw error;
    }

    router.push("/club/dashboard/posts");
    router.refresh();
  };

  return (
    <CreatePostForm
      activityTypes={activityTypes}
      categories={categories}
      faculties={faculties}
      onSubmit={handleSubmit}
    />
  );
}
