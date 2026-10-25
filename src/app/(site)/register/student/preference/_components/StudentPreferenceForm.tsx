"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { api } from "@/trpc/react";
import { Button, TagSelection } from "@/components";
import {
  GENERIC_ERROR_MESSAGE,
  studentPreferenceSchema,
  type StudentPreferenceFormValues,
} from "@/app/(site)/register/student/student-preference-schema";

interface StudentPreferenceFormProps {
  categories: { id: number; label: string; fontColor: string; backgroundColor: string }[];
  activityTypes: { id: number; label: string }[];
}

export function StudentPreferenceForm({ categories, activityTypes }: StudentPreferenceFormProps) {
  const router = useRouter();
  const saveMutation = api.students.savePreferences.useMutation();
  const rootErrorRef = useRef<HTMLParagraphElement>(null);

  const {
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentPreferenceFormValues>({
    resolver: zodResolver(studentPreferenceSchema),
    defaultValues: { categoryIds: [], activityTypeIds: [] },
  });

  useEffect(() => {
    if (!isSubmitting && errors.root?.message) {
      rootErrorRef.current?.focus();
    }
  }, [isSubmitting, errors.root?.message]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await saveMutation.mutateAsync(values);
    } catch (cause) {
      console.error("[register] student preferences failed", cause);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    router.push("/register/student/source");
    // force server components to re-render with fresh registration status
    router.refresh();
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      <fieldset inert={isSubmitting || undefined} aria-busy={isSubmitting} className="contents">
        <div className="flex flex-col gap-4">
          <Controller
            control={control}
            name="categoryIds"
            render={({ field }) => (
              <TagSelection
                label="หมวดหมู่"
                required
                options={categories.map((category) => ({
                  value: category.id,
                  label: category.label,
                  color: category.fontColor,
                  bgColor: category.backgroundColor,
                }))}
                value={field.value}
                onValueChange={field.onChange}
                error={!!errors.categoryIds}
                errorMessage={errors.categoryIds?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="activityTypeIds"
            render={({ field }) => (
              <TagSelection
                label="ประเภทกิจกรรม"
                required
                options={activityTypes.map((type) => ({ value: type.id, label: type.label }))}
                value={field.value}
                onValueChange={field.onChange}
                error={!!errors.activityTypeIds}
                errorMessage={errors.activityTypeIds?.message}
              />
            )}
          />
        </div>

        {errors.root?.message && (
          <p
            ref={rootErrorRef}
            tabIndex={-1}
            role="alert"
            className="text-error text-center text-sm"
          >
            {errors.root.message}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          ถัดไป
        </Button>
      </fieldset>
    </form>
  );
}
