"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SquarePen } from "lucide-react";

import { Button } from "@/components/ui";
import {
  buildClubProfileFormValues,
  ClubProfileDetails,
  ClubProfileForm,
  getClubImageContentType,
  uploadClubImage,
  type ClubImageContentType,
  type ClubProfileFormValues,
} from "@/features/club/profile";
import type { ClubDetailOutputDTO } from "@/server/api/modules/clubs/dto";
import type { AffiliationOutputDTO, CategoryOutputDTO } from "@/server/api/modules/master-data/dto";
import { api } from "@/trpc/react";

type ClubDashboardProfileManagerProps = {
  initialProfile: ClubDetailOutputDTO;
  affiliations: AffiliationOutputDTO[];
  categories: CategoryOutputDTO[];
};

function requireContentType(file: File): ClubImageContentType {
  const contentType = getClubImageContentType(file);
  if (!contentType) throw new Error("Unsupported club image type");
  return contentType;
}

function ActiveStatus() {
  return (
    <div className="font-ibm-plex text-foreground-muted flex shrink-0 items-center gap-2 pt-1 text-xs leading-5 md:text-sm md:leading-[23px]">
      <span aria-hidden="true" className="bg-placeholder size-2 rounded-full" />
      <span>กำลังแก้ไขอยู่</span>
    </div>
  );
}

export function ClubDashboardProfileManager({
  initialProfile,
  affiliations,
  categories,
}: ClubDashboardProfileManagerProps) {
  const router = useRouter();
  const [profile, setProfile] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const getLogoUploadUrl = api.clubs.getLogoUploadUrl.useMutation();
  const getImagesUploadUrl = api.clubs.getImagesUploadUrl.useMutation();
  const updateProfile = api.clubs.updateProfile.useMutation();

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
      uploads.push(uploadClubImage(newLogo, { url: logoUpload.url, contentType: logoContentType }));
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

    const updatedProfile = await updateProfile.mutateAsync({
      name: values.name,
      image: logoUrl,
      affiliationId: affiliation.id,
      categories: categoryIds,
      shortDescription: values.shortDescription,
      longDescription: values.longDescription,
      imageUrls,
      contacts: normalizedContacts,
    });

    setProfile(updatedProfile);
    setIsEditing(false);
    router.refresh();
  };

  if (isEditing) {
    return (
      <ClubProfileForm
        affiliations={affiliations.map(({ label }) => label)}
        categories={categories}
        initialValues={buildClubProfileFormValues(profile)}
        onSubmit={handleSubmit}
        onCancel={() => setIsEditing(false)}
        cancelLabel="ยกเลิก"
        submitLabel="ยืนยัน"
        headerAccessory={<ActiveStatus />}
      />
    );
  }

  return (
    <ClubProfileDetails
      club={profile}
      title="ข้อมูลทั่วไป"
      headerAction={
        <Button
          type="button"
          variant="outline"
          aria-label="แก้ไขโปรไฟล์ชมรม"
          className="h-9 shrink-0 px-4 text-sm md:text-sm"
          onClick={() => setIsEditing(true)}
        >
          <SquarePen aria-hidden="true" className="size-4" />
          แก้ไข
        </Button>
      }
    />
  );
}
