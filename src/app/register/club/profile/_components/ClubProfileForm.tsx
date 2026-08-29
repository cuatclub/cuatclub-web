"use client";

import { useEffect, useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Card, CardContent, Input, MultiSelect, Select, Textarea } from "@/components/ui";
import { ClubGalleryField } from "@/app/register/club/profile/_components/ClubGalleryField";
import { ClubLogoField } from "@/app/register/club/profile/_components/ClubLogoField";
import {
  ATMOSPHERE_PHOTOS_MAX_MESSAGE,
  clubProfileSchema,
  getImageFileValidationMessage,
  MAX_ATMOSPHERE_PHOTOS,
  type ClubProfileImage,
  type ClubProfileFormValues,
} from "@/app/register/club/profile/profile-schema";

type ClubProfileFormProps = {
  affiliations: readonly string[];
  categories: readonly string[];
  initialValues: ClubProfileFormValues;
  onSubmit: (values: ClubProfileFormValues) => Promise<void>;
};

const valueUpdateOptions = {
  shouldTouch: true,
  shouldDirty: true,
  shouldValidate: true,
} as const;

const labelClassName =
  "font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]";

export function ClubProfileForm({
  affiliations,
  categories,
  initialValues,
  onSubmit,
}: ClubProfileFormProps) {
  const router = useRouter();
  const submitErrorRef = useRef<HTMLParagraphElement>(null);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ClubProfileFormValues>({
    resolver: zodResolver(clubProfileSchema),
    defaultValues: initialValues,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const logo = useWatch({ control, name: "logo" });
  const atmospherePhotos = useWatch({ control, name: "atmospherePhotos" });

  useEffect(() => {
    if (errors.root?.submit) submitErrorRef.current?.focus();
  }, [errors.root?.submit]);

  const updateLogo = (image: ClubProfileImage | null) => {
    const validationMessage =
      image?.kind === "new" ? getImageFileValidationMessage(image.file) : null;
    if (validationMessage) {
      setValue("logo", logo, valueUpdateOptions);
      setError("logo", { type: "manual", message: validationMessage });
      return;
    }

    clearErrors("logo");
    setValue("logo", image, valueUpdateOptions);
  };

  const addAtmospherePhotos = (files: File[]) => {
    const validationMessage = files
      .map(getImageFileValidationMessage)
      .find((message): message is string => message !== null);

    if (validationMessage) {
      setValue("atmospherePhotos", atmospherePhotos, valueUpdateOptions);
      setError("atmospherePhotos", { type: "manual", message: validationMessage });
      return;
    }

    if (atmospherePhotos.length + files.length > MAX_ATMOSPHERE_PHOTOS) {
      setValue("atmospherePhotos", atmospherePhotos, valueUpdateOptions);
      setError("atmospherePhotos", {
        type: "manual",
        message: ATMOSPHERE_PHOTOS_MAX_MESSAGE,
      });
      return;
    }

    clearErrors("atmospherePhotos");
    setValue(
      "atmospherePhotos",
      [...atmospherePhotos, ...files.map((file) => ({ kind: "new" as const, file }))],
      valueUpdateOptions
    );
  };

  const removeAtmospherePhoto = (index: number) => {
    clearErrors("atmospherePhotos");
    setValue(
      "atmospherePhotos",
      atmospherePhotos.filter((_, currentIndex) => currentIndex !== index),
      valueUpdateOptions
    );
  };

  const submitForm = handleSubmit(async (values) => {
    clearErrors("root.submit");
    try {
      await onSubmit(values);
    } catch {
      setError("root.submit", {
        type: "server",
        message: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  });

  return (
    <Card className="w-full max-w-[874px] gap-0 py-0">
      <form onSubmit={submitForm} noValidate>
        <fieldset disabled={isSubmitting} className="contents">
          <CardContent className="flex flex-col gap-6 px-8 py-8">
            <h2 className="font-ibm-plex text-primary text-lg leading-[30px] font-bold md:text-2xl md:leading-[33px]">
              ข้อมูลทั่วไป
            </h2>

            <ClubLogoField
              value={logo}
              errorMessage={errors.logo?.message}
              disabled={isSubmitting}
              onChange={updateLogo}
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,2fr)] md:gap-5">
              <div className="flex min-w-0 flex-col gap-1">
                <label htmlFor="club-name" className={labelClassName}>
                  ชื่อชมรม <span className="text-error">*</span>
                </label>
                <Input
                  id="club-name"
                  placeholder="กรอกชื่อชมรม"
                  aria-required="true"
                  error={!!errors.name}
                  errorMessage={errors.name?.message}
                  {...register("name")}
                />
              </div>

              <Controller
                control={control}
                name="affiliation"
                render={({ field, fieldState }) => (
                  <label className="flex min-w-0 flex-col gap-1">
                    <span className={labelClassName}>
                      คณะ/สังกัด <span className="text-error">*</span>
                    </span>
                    <Select
                      name={field.name}
                      options={[...affiliations]}
                      value={field.value}
                      placeholder="เลือกคณะ/สังกัด"
                      triggerClassName="outline-none"
                      disabled={isSubmitting}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      onValueChange={(value) => {
                        field.onChange(value);
                        field.onBlur();
                      }}
                    />
                  </label>
                )}
              />

              <Controller
                control={control}
                name="categories"
                render={({ field, fieldState }) => (
                  <label className="flex min-w-0 flex-col gap-1">
                    <span className={labelClassName}>
                      หมวดหมู่ <span className="text-error">*</span>
                    </span>
                    <MultiSelect
                      name={field.name}
                      options={[...categories]}
                      value={field.value}
                      placeholder="เลือกหมวดหมู่"
                      disabled={isSubmitting}
                      error={!!fieldState.error}
                      errorMessage={fieldState.error?.message}
                      onValueChange={(value) => {
                        field.onChange(value);
                        field.onBlur();
                      }}
                    />
                  </label>
                )}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="short-description" className={labelClassName}>
                คำอธิบายแบบย่อ <span className="text-error">*</span>
              </label>
              <Textarea
                id="short-description"
                placeholder="กรอกคำอธิบายเกี่ยวกับชมรมของคุณแบบย่อ (ความยาวไม่เกิน 180 ตัวอักษร)"
                aria-required="true"
                error={!!errors.shortDescription}
                errorMessage={errors.shortDescription?.message}
                {...register("shortDescription")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="long-description" className={labelClassName}>
                คำอธิบายแบบละเอียด <span className="text-error">*</span>
              </label>
              <Textarea
                id="long-description"
                placeholder="กรอกคำอธิบายเกี่ยวกับชมรมของคุณแบบละเอียด"
                aria-required="true"
                error={!!errors.longDescription}
                errorMessage={errors.longDescription?.message}
                className="min-h-40"
                {...register("longDescription")}
              />
            </div>

            <ClubGalleryField
              value={atmospherePhotos}
              errorMessage={errors.atmospherePhotos?.message}
              disabled={isSubmitting}
              onAddFiles={addAtmospherePhotos}
              onRemove={removeAtmospherePhoto}
            />
          </CardContent>

          <CardContent className="border-border flex flex-col gap-6 border-t px-8 py-6">
            <h2 className="font-ibm-plex text-primary text-lg leading-[30px] font-bold md:text-2xl md:leading-[33px]">
              ช่องทางติดต่อ
            </h2>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Instagram"
                placeholder="กรอก Instagram"
                error={!!errors.contacts?.instagram}
                errorMessage={errors.contacts?.instagram?.message}
                {...register("contacts.instagram")}
              />
              <Input
                label="Facebook"
                placeholder="กรอก Facebook"
                error={!!errors.contacts?.facebook}
                errorMessage={errors.contacts?.facebook?.message}
                {...register("contacts.facebook")}
              />
              <Input
                label="TikTok"
                placeholder="กรอก TikTok"
                error={!!errors.contacts?.tiktok}
                errorMessage={errors.contacts?.tiktok?.message}
                {...register("contacts.tiktok")}
              />
              <Input
                label="Line OA"
                placeholder="กรอก Line OA"
                error={!!errors.contacts?.lineOa}
                errorMessage={errors.contacts?.lineOa?.message}
                {...register("contacts.lineOa")}
              />
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-1/4"
                onClick={() => router.back()}
              >
                ย้อนกลับ
              </Button>
              <Button
                type="submit"
                className="w-full sm:w-1/4"
                disabled={!isValid || isSubmitting}
                isLoading={isSubmitting}
              >
                ถัดไป
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
          </CardContent>
        </fieldset>
      </form>
    </Card>
  );
}
