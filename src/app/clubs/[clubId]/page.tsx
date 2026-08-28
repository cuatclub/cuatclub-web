import { notFound } from "next/navigation";
import {
  BackLink,
  ClubAbout,
  ClubContacts,
  ClubGallery,
  ClubHeader,
} from "@/app/clubs/[clubId]/_components";
import { api } from "@/trpc/server";

type ClubDetailPageProps = {
  params: Promise<{ clubId: string }>;
};

export default async function ClubDetailPage({ params }: ClubDetailPageProps) {
  const { clubId } = await params;
  const club = await api.clubs.getById({ clubId });

  if (!club) notFound();

  const about = club.longDescription ?? club.shortDescription;

  return (
    <>
      <main className="mx-auto flex w-full max-w-[1512px] flex-col gap-9 px-5 pt-2.5 pb-5 md:gap-12 md:px-8 md:py-10 xl:px-25">
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
