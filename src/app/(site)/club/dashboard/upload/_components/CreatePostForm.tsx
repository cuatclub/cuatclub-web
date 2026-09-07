"use client";

import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Tag,
  TagSelection,
  Textarea,
} from "@/components/ui";
import { PostPosterField } from "@/app/(site)/club/dashboard/upload/_components/PostPosterField";
import { DateRangeField } from "@/app/(site)/club/dashboard/upload/_components/DateRangeField";
import { AudienceRadioField } from "@/app/(site)/club/dashboard/upload/_components/AudienceRadioField";
import {
  YEAR_LEVELS,
  createPostSchema,
  SUBMIT_ERROR_MESSAGE,
  type CreatePostFormValues,
} from "@/app/(site)/club/dashboard/upload/create-post-schema";

export type ActivityTypeOption = { id: number; label: string };
export type CategoryOption = {
  id: number;
  label: string;
  fontColor: string;
  backgroundColor: string;
};
export type FacultyOption = { id: number; label: string };

type CreatePostFormProps = {
  activityTypes: readonly ActivityTypeOption[];
  categories: readonly CategoryOption[];
  faculties: readonly FacultyOption[];
  onSubmit: (values: CreatePostFormValues) => Promise<void>;
};

const EMPTY_VALUES: CreatePostFormValues = {
  poster: null,
  title: "",
  applicationFormUrl: "",
  applicationStartAt: null,
  applicationEndAt: null,
  activityType: "",
  categoryIds: [],
  description: "",
  audience: null,
  yearLevels: [],
  facultyIds: [],
};

const valueUpdateOptions = {
  shouldTouch: true,
  shouldDirty: true,
  shouldValidate: true,
} as const;

const YEAR_LEVEL_OPTIONS = YEAR_LEVELS.map((year) => ({ value: year, label: `ปี ${year}` }));

export function CreatePostForm({
  activityTypes,
  categories,
  faculties,
  onSubmit,
}: CreatePostFormProps) {
  const submitErrorRef = useRef<HTMLParagraphElement>(null);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostSchema),
    defaultValues: EMPTY_VALUES,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const applicationStartAt = useWatch({ control, name: "applicationStartAt" });
  const applicationEndAt = useWatch({ control, name: "applicationEndAt" });

  useEffect(() => {
    if (errors.root?.submit) submitErrorRef.current?.focus();
  }, [errors.root?.submit]);

  const facultyIdList = faculties.map((faculty) => faculty.id);

  const submitForm = handleSubmit(async (values) => {
    clearErrors("root.submit");
    try {
      await onSubmit(values);
    } catch {
      setError("root.submit", { type: "server", message: SUBMIT_ERROR_MESSAGE });
    }
  });

  return (
    <Card className="w-full max-w-[1076px] gap-0 p-6 md:px-6 md:py-8">
      <form onSubmit={submitForm} noValidate>
        <fieldset
          inert={isSubmitting || undefined}
          aria-busy={isSubmitting}
          className="m-0 flex flex-col gap-8 border-0 p-0 md:gap-9"
        >
          <CardContent className="flex flex-col gap-4 px-0 md:gap-6">
            <h2 className="font-ibm-plex text-primary text-xl leading-[27px] font-bold">
              ข้อมูลทั่วไป
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-[282px_minmax(0,1fr)] md:gap-9">
              <Controller
                control={control}
                name="poster"
                render={({ field, fieldState }) => (
                  <PostPosterField
                    value={field.value}
                    errorMessage={fieldState.error?.message}
                    onChange={(file) => {
                      field.onChange(file);
                      field.onBlur();
                    }}
                  />
                )}
              />

              <div className="flex min-w-0 flex-col gap-6">
                <Input
                  id="post-title"
                  label="หัวข้อ"
                  required
                  placeholder="กรอกหัวข้อโพสต์"
                  error={!!errors.title}
                  errorMessage={errors.title?.message}
                  {...register("title")}
                />

                <Input
                  id="post-application-form-url"
                  label="ฟอร์มรับสมัคร"
                  required
                  placeholder="https://forms.gle/..."
                  error={!!errors.applicationFormUrl}
                  errorMessage={errors.applicationFormUrl?.message}
                  {...register("applicationFormUrl")}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <DateRangeField
                    label="ช่วงเวลา"
                    required
                    startValue={applicationStartAt}
                    endValue={applicationEndAt}
                    error={!!errors.applicationStartAt || !!errors.applicationEndAt}
                    errorMessage={
                      errors.applicationStartAt?.message ?? errors.applicationEndAt?.message
                    }
                    onChange={(start, end) => {
                      setValue("applicationStartAt", start, valueUpdateOptions);
                      setValue("applicationEndAt", end, valueUpdateOptions);
                    }}
                  />

                  <Controller
                    control={control}
                    name="activityType"
                    render={({ field, fieldState }) => (
                      <Select
                        label="ประเภทกิจกรรม"
                        required
                        name={field.name}
                        options={activityTypes.map((type) => type.label)}
                        value={field.value || undefined}
                        placeholder="เลือกประเภทกิจกรรม"
                        className="min-w-0"
                        error={!!fieldState.error}
                        errorMessage={fieldState.error?.message}
                        onValueChange={(value) => {
                          field.onChange(value);
                          field.onBlur();
                        }}
                      />
                    )}
                  />
                </div>

                <Controller
                  control={control}
                  name="categoryIds"
                  render={({ field, fieldState }) => (
                    <TagSelection<number>
                      label="หมวดหมู่"
                      required
                      options={categories.map((category) => ({
                        value: category.id,
                        label: category.label,
                        color: category.fontColor,
                        bgColor: category.backgroundColor,
                      }))}
                      value={field.value}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      onValueChange={(value) => {
                        field.onChange(value);
                        field.onBlur();
                      }}
                    />
                  )}
                />

                <Textarea
                  id="post-description"
                  label="รายละเอียด"
                  required
                  placeholder="กรอกรายละเอียดกิจกรรม"
                  className="min-h-[120px]"
                  error={!!errors.description}
                  errorMessage={errors.description?.message}
                  {...register("description")}
                />
              </div>
            </div>
          </CardContent>

          <div className="border-border border-t" />

          <CardContent className="flex flex-col gap-4 px-0 md:gap-6">
            <h2 className="font-ibm-plex text-primary text-xl leading-[27px] font-bold">
              คุณสมบัติ
            </h2>

            <Controller
              control={control}
              name="audience"
              render={({ field, fieldState }) => (
                <AudienceRadioField
                  label="ผู้มีสิทธิ์เข้าร่วม"
                  required
                  value={field.value}
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  onChange={(value) => {
                    field.onChange(value);
                    field.onBlur();
                  }}
                />
              )}
            />

            <Controller
              control={control}
              name="yearLevels"
              render={({ field, fieldState }) => {
                const allSelected = field.value.length === YEAR_LEVELS.length;
                return (
                  <TagSelection<number>
                    label="ชั้นปี"
                    required
                    options={YEAR_LEVEL_OPTIONS}
                    value={field.value}
                    error={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    onValueChange={(value) => {
                      field.onChange(value);
                      field.onBlur();
                    }}
                    trailing={
                      <Tag
                        type="selectable"
                        selected={allSelected}
                        onClick={() => {
                          field.onChange(allSelected ? [] : [...YEAR_LEVELS]);
                          field.onBlur();
                        }}
                      >
                        เลือกทั้งหมด
                      </Tag>
                    }
                  />
                );
              }}
            />

            <Controller
              control={control}
              name="facultyIds"
              render={({ field, fieldState }) => {
                const allSelected =
                  facultyIdList.length > 0 && field.value.length === facultyIdList.length;
                return (
                  <TagSelection<number>
                    label="คณะ"
                    required
                    options={faculties.map((faculty) => ({
                      value: faculty.id,
                      label: faculty.label,
                    }))}
                    value={field.value}
                    error={!!fieldState.error}
                    errorMessage={fieldState.error?.message}
                    onValueChange={(value) => {
                      field.onChange(value);
                      field.onBlur();
                    }}
                    trailing={
                      <Tag
                        type="selectable"
                        selected={allSelected}
                        onClick={() => {
                          field.onChange(allSelected ? [] : [...facultyIdList]);
                          field.onBlur();
                        }}
                      >
                        เลือกทั้งหมด
                      </Tag>
                    }
                  />
                );
              }}
            />
          </CardContent>

          <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-[200px]"
              onClick={() => reset(EMPTY_VALUES)}
            >
              ล้างทั้งหมด
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-[200px]"
              disabled={isSubmitting}
              isLoading={isSubmitting}
            >
              ยืนยัน
            </Button>
          </div>

          {errors.root?.submit?.message && (
            <p
              ref={submitErrorRef}
              tabIndex={-1}
              role="alert"
              className="font-ibm-plex text-error text-sm leading-[23px] outline-none"
            >
              {errors.root.submit.message}
            </p>
          )}
        </fieldset>
      </form>
    </Card>
  );
}
