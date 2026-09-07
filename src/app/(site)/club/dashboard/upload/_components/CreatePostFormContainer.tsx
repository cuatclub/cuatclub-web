"use client";

import { useRouter } from "next/navigation";

import { api } from "@/trpc/react";
import {
  CreatePostForm,
  type ActivityTypeOption,
  type CategoryOption,
  type FacultyOption,
} from "@/app/(site)/club/dashboard/upload/_components/CreatePostForm";
import { uploadActivityPoster } from "@/app/(site)/club/dashboard/upload/_lib/upload-activity-poster";
import {
  getPosterContentType,
  type CreatePostFormValues,
} from "@/app/(site)/club/dashboard/upload/create-post-schema";

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
  const createActivity = api.activities.create.useMutation();

  const handleSubmit = async (values: CreatePostFormValues) => {
    // The schema guarantees these are set by the time submit runs; narrow for TS.
    if (!values.poster) throw new Error("Poster is required");
    if (!values.applicationStartAt || !values.applicationEndAt) {
      throw new Error("Application window is required");
    }
    if (!values.audience) throw new Error("Audience is required");

    const activityType = activityTypes.find((type) => type.label === values.activityType);
    if (!activityType) throw new Error("Selected activity type was not found");

    const contentType = getPosterContentType(values.poster);
    if (!contentType) throw new Error("Unsupported poster image type");

    const posterTarget = await getPosterUploadUrl.mutateAsync({ contentType });
    await uploadActivityPoster(values.poster, { url: posterTarget.url, contentType });

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
