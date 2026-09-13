"use client";

import { Button, Card } from "@/components/ui";
import {
  PostForm,
  type ActivityTypeOption,
  type CategoryOption,
  type FacultyOption,
} from "@/app/(site)/club/dashboard/posts/_components/PostForm";
import {
  EMPTY_POST_FORM_VALUES,
  type CreatePostFormValues,
} from "@/app/(site)/club/dashboard/posts/post-schema";

export type { ActivityTypeOption, CategoryOption, FacultyOption };

type CreatePostFormProps = {
  activityTypes: readonly ActivityTypeOption[];
  categories: readonly CategoryOption[];
  faculties: readonly FacultyOption[];
  onSubmit: (values: CreatePostFormValues) => Promise<void>;
};

export function CreatePostForm({
  activityTypes,
  categories,
  faculties,
  onSubmit,
}: CreatePostFormProps) {
  return (
    <Card className="w-full max-w-[1076px] gap-0 p-6 md:px-6 md:py-8">
      <PostForm
        activityTypes={activityTypes}
        categories={categories}
        faculties={faculties}
        defaultValues={EMPTY_POST_FORM_VALUES}
        onSubmit={onSubmit}
        footer={({ isSubmitting, isValid, reset }) => (
          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" className="w-full sm:w-[200px]" onClick={reset}>
              ล้างทั้งหมด
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
    </Card>
  );
}
