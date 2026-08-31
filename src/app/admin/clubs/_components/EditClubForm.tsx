"use client";

import { useRef } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button, Input, Select, TagSelection, Textarea } from "@/components/ui";
import { ClubGalleryField } from "@/app/(site)/register/club/profile/_components/ClubGalleryField";
import { ClubLogoField } from "@/app/(site)/register/club/profile/_components/ClubLogoField";
import { uploadClubImage } from "@/app/(site)/register/club/profile/_lib/club-profile-upload";
import {
  clubProfileSchema,
  getClubImageContentType,
  getImageFileValidationMessage,
  type ClubImageContentType,
  type ClubProfileImage,
  type ClubProfileFormValues,
} from "@/app/(site)/register/club/profile/profile-schema";
import type { ClubDetailOutputDTO } from "@/server/api/modules/clubs/dto";
import type { AffiliationOutputDTO, CategoryOutputDTO } from "@/server/api/modules/master-data/dto";
import { api } from "@/trpc/react";

type EditClubFormProps = {
  clubId: string;
  affiliations: AffiliationOutputDTO[];
  categories: CategoryOutputDTO[];
  existingProfile: ClubDetailOutputDTO;
  onSaved: () => void;
  onCancel: () => void;
};

function buildInitialValues(existingProfile: ClubDetailOutputDTO): ClubProfileFormValues {
  return {
    logo: existingProfile.logoUrl ? { kind: "persisted", url: existingProfile.logoUrl } : null,
    name: existingProfile.name,
    affiliation: existingProfile.affiliation?.label ?? "",
    categories: existingProfile.categories.map(({ label }) => label),
    shortDescription: existingProfile.shortDescription ?? "",
    longDescription: existingProfile.longDescription ?? "",
    atmospherePhotos: existingProfile.imageUrls.map((url) => ({ kind: "persisted", url })),
    contacts: {
      instagram: existingProfile.contacts?.instagram ?? "",
      facebook: existingProfile.contacts?.facebook ?? "",
      tiktok: existingProfile.contacts?.tiktok ?? "",
      lineOa: existingProfile.contacts?.line_oa ?? "",
    },
  };
}

function requireContentType(file: File): ClubImageContentType {
  const contentType = getClubImageContentType(file);
  if (!contentType) throw new Error("Unsupported club image type");
  return contentType;
}

const valueUpdateOptions = {
  shouldTouch: true,
  shouldDirty: true,
  shouldValidate: true,
} as const;

export function EditClubForm({
  clubId,
  affiliations,
  categories,
  existingProfile,
  onSaved,
  onCancel,
}: EditClubFormProps) {
  const utils = api.useUtils();
  const getLogoUploadUrl = api.clubs.getLogoUploadUrlForAdmin.useMutation();
  const getImagesUploadUrl = api.clubs.getImagesUploadUrlForAdmin.useMutation();
  const updateClub = api.clubs.updateForAdmin.useMutation();

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
    defaultValues: buildInitialValues(existingProfile),
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const logo = useWatch({ control, name: "logo" });
  const atmospherePhotos = useWatch({ control, name: "atmospherePhotos" });

  const updateLogo = (image: ClubProfileImage | null) => {
    const validationMessage =
      image?.kind === "new" ? getImageFileValidationMessage(image.file) : null;
    if (validationMessage) {
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
      setError("atmospherePhotos", { type: "manual", message: validationMessage });
      return;
    }

    if (atmospherePhotos.length + files.length > 5) {
      setError("atmospherePhotos", {
        type: "manual",
        message: "อัปโหลดรูปบรรยากาศได้สูงสุด 5 รูป",
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
      const affiliation = affiliations.find(({ label }) => label === values.affiliation);
      if (!affiliation) throw new Error("Selected affiliation was not found");

      const categoryIds: number[] = [];
      for (const selectedLabel of values.categories) {
        const category = categories.find(({ label }) => label === selectedLabel);
        if (!category) throw new Error("Selected category was not found");
        categoryIds.push(category.id);
      }

      if (!values.logo) throw new Error("Club logo is required");

      const newLogo = values.logo.kind === "new" ? values.logo.file : null;
      const newGalleryFiles = values.atmospherePhotos.flatMap((image) =>
        image.kind === "new" ? [image.file] : []
      );
      const logoContentType = newLogo ? requireContentType(newLogo) : null;
      const galleryContentTypes = newGalleryFiles.map(requireContentType);

      const [logoUpload, galleryUploads] = await Promise.all([
        newLogo && logoContentType
          ? getLogoUploadUrl.mutateAsync({ clubId, contentType: logoContentType })
          : Promise.resolve(null),
        galleryContentTypes.length > 0
          ? getImagesUploadUrl.mutateAsync({
              clubId,
              files: galleryContentTypes.map((contentType) => ({ contentType })),
            })
          : Promise.resolve(null),
      ]);

      if (newLogo && (!logoContentType || !logoUpload)) {
        throw new Error("Logo upload target was not created");
      }

      const presignedGalleryUploads = galleryUploads?.presignedUrls ?? [];
      if (presignedGalleryUploads.length !== newGalleryFiles.length) {
        throw new Error("Gallery upload target count did not match");
      }

      const uploads: Promise<void>[] = [];
      if (newLogo && logoContentType && logoUpload) {
        uploads.push(
          uploadClubImage(newLogo, { url: logoUpload.url, contentType: logoContentType })
        );
      }

      for (const [index, file] of newGalleryFiles.entries()) {
        const upload = presignedGalleryUploads[index];
        const contentType = galleryContentTypes[index];
        if (!upload || !contentType) throw new Error("Gallery upload target was not created");
        uploads.push(uploadClubImage(file, { url: upload.url, contentType }));
      }
      await Promise.all(uploads);

      const logoUrl = values.logo.kind === "persisted" ? values.logo.url : logoUpload?.publicUrl;
      if (!logoUrl) throw new Error("Club logo URL was not created");

      const imageUrls: string[] = [];
      let newGalleryIndex = 0;
      for (const image of values.atmospherePhotos) {
        if (image.kind === "persisted") {
          imageUrls.push(image.url);
          continue;
        }

        const upload = presignedGalleryUploads[newGalleryIndex];
        if (!upload) throw new Error("Gallery URL was not created");
        imageUrls.push(upload.publicUrl);
        newGalleryIndex += 1;
      }

      const contacts = {
        instagram: values.contacts.instagram.trim(),
        facebook: values.contacts.facebook.trim(),
        tiktok: values.contacts.tiktok.trim(),
        line_oa: values.contacts.lineOa.trim(),
      };
      const normalizedContacts = Object.values(contacts).every((value) => value === "")
        ? null
        : contacts;

      await updateClub.mutateAsync({
        id: clubId,
        name: values.name,
        image: logoUrl,
        affiliationId: affiliation.id,
        categories: categoryIds,
        shortDescription: values.shortDescription,
        longDescription: values.longDescription,
        imageUrls,
        contacts: normalizedContacts,
      });

      await Promise.all([
        utils.clubs.getById.invalidate({ clubId }),
        utils.clubs.getAllForAdmin.invalidate(),
      ]);

      onSaved();
    } catch {
      setError("root.submit", {
        type: "server",
        message: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง",
      });
    }
  });

  return (
    <form onSubmit={submitForm} noValidate>
      <fieldset
        inert={isSubmitting || undefined}
        aria-busy={isSubmitting}
        className="m-0 flex flex-col gap-6 border-0 p-0"
      >
        <ClubLogoField value={logo} errorMessage={errors.logo?.message} onChange={updateLogo} />

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <Input
            id="admin-club-name"
            label="ชื่อชมรม"
            required
            placeholder="กรอกชื่อชมรม"
            error={!!errors.name}
            errorMessage={errors.name?.message}
            wrapperClassName="min-w-0"
            {...register("name")}
          />

          <Controller
            control={control}
            name="affiliation"
            render={({ field, fieldState }) => (
              <Select
                label="คณะ/สังกัด"
                required
                name={field.name}
                options={affiliations.map(({ label }) => label)}
                value={field.value}
                placeholder="เลือกคณะ/สังกัด"
                triggerClassName="outline-none"
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
          name="categories"
          render={({ field, fieldState }) => (
            <TagSelection
              label="หมวดหมู่"
              required
              name={field.name}
              options={categories.map(({ label, fontColor, backgroundColor }) => ({
                value: label,
                label,
                color: fontColor,
                bgColor: backgroundColor,
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
          id="admin-short-description"
          label="คำอธิบายแบบย่อ"
          required
          placeholder="กรอกคำอธิบายเกี่ยวกับชมรมแบบย่อ (ความยาวไม่เกิน 180 ตัวอักษร)"
          error={!!errors.shortDescription}
          errorMessage={errors.shortDescription?.message}
          {...register("shortDescription")}
        />

        <Textarea
          id="admin-long-description"
          label="คำอธิบายแบบละเอียด"
          required
          placeholder="กรอกคำอธิบายเกี่ยวกับชมรมแบบละเอียด"
          error={!!errors.longDescription}
          errorMessage={errors.longDescription?.message}
          className="min-h-40"
          {...register("longDescription")}
        />

        <ClubGalleryField
          value={atmospherePhotos}
          errorMessage={errors.atmospherePhotos?.message}
          onAddFiles={addAtmospherePhotos}
          onRemove={removeAtmospherePhoto}
        />

        <div className="border-border border-t" />

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

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            ยกเลิก
          </Button>
          <Button type="submit" disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
            บันทึก
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
  );
}
