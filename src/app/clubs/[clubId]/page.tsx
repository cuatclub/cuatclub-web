import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Navbar } from "@/components/Navbar";
import { BackLink } from "@/app/clubs/[clubId]/_components/BackLink";
import { ClubAbout } from "@/app/clubs/[clubId]/_components/ClubAbout";
import { ClubContacts } from "@/app/clubs/[clubId]/_components/ClubContacts";
import { ClubGallery } from "@/app/clubs/[clubId]/_components/ClubGallery";
import { ClubHeader } from "@/app/clubs/[clubId]/_components/ClubHeader";
import { getMockClubById } from "@/app/clubs/[clubId]/_mock/club-detail.mock";

type ClubDetailPageProps = {
  params: Promise<{ clubId: string }>;
};

export async function generateMetadata({ params }: ClubDetailPageProps): Promise<Metadata> {
  const { clubId } = await params;
  const club = await getMockClubById(clubId);

  if (!club) return { title: "ไม่พบชมรม" };

  return {
    title: club.name,
    description: club.shortDescription ?? club.longDescription ?? undefined,
  };
}

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { clubId } = await params;
  const club = await getMockClubById(clubId);

  if (!club) notFound();

  const about = club.longDescription ?? club.shortDescription;

  return (
    <>
      <Navbar />

      <main className="mx-auto flex w-full max-w-[1512px] flex-col gap-9 px-5 py-2.5 md:gap-12 md:px-8 md:py-10 xl:px-25">
        <BackLink />

        {/* Content sits 32px inside the back control on desktop, per the Figma frame. */}
        <div className="flex flex-col gap-9 md:gap-12 md:px-8">
          <ClubHeader
            name={club.name}
            logoUrl={club.logoUrl}
            affiliation={club.affiliation}
            categories={club.categories}
          />

          {about && <ClubAbout description={about} />}

          {club.imageUrls.length > 0 && (
            <ClubGallery photos={club.imageUrls} clubName={club.name} />
          )}

          {club.contacts && <ClubContacts contacts={club.contacts} clubName={club.name} />}
        </div>
      </main>
    </>
  );
}
