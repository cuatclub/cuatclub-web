"use client";

import { useRouter } from "next/navigation";

import { ClubProfileForm } from "@/app/register/club/profile/_components/ClubProfileForm";
import { uploadClubImage } from "@/app/register/club/profile/_lib/club-profile-upload";
import {
  getClubImageContentType,
  type ClubImageContentType,
  type ClubProfileFormValues,
} from "@/app/register/club/profile/profile-schema";
import type { ClubDetailOutputDTO } from "@/server/api/modules/clubs/dto";
import type { AffiliationOutputDTO, CategoryOutputDTO } from "@/server/api/modules/master-data/dto";
import { api } from "@/trpc/react";

type ClubProfileFormContainerProps = {
  clubId: string;
  affiliations: AffiliationOutputDTO[];
  categories: CategoryOutputDTO[];
  existingProfile: ClubDetailOutputDTO;
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

export function ClubProfileFormContainer({
  clubId,
  affiliations,
  categories,
  existingProfile,
}: ClubProfileFormContainerProps) {
  const router = useRouter();
  const getLogoUploadUrl = api.clubs.getLogoUploadUrl.useMutation();
  const getImagesUploadUrl = api.clubs.getImagesUploadUrl.useMutation();
  const saveProfile = api.clubs.saveClubProfileRegistration.useMutation();

  const initialValues = buildInitialValues(existingProfile);

  const handleSubmit = async (values: ClubProfileFormValues) => {
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
        ? getLogoUploadUrl.mutateAsync({ contentType: logoContentType })
        : Promise.resolve(null),
      galleryContentTypes.length > 0
        ? getImagesUploadUrl.mutateAsync({
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
        uploadClubImage(newLogo, {
          url: logoUpload.url,
          contentType: logoContentType,
        })
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

    const result = await saveProfile.mutateAsync({
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

    if (result.registrationStatus !== "INFO_SUBMITTED") {
      throw new Error("Club profile status did not update");
    }

    router.push("/register/club/review");
    router.refresh();
  };

  return (
    <ClubProfileForm
      affiliations={affiliations.map(({ label }) => label)}
      categories={categories.map(({ label }) => label)}
      initialValues={initialValues}
      onSubmit={handleSubmit}
    />
  );
}
