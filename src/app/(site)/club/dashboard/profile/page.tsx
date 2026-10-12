import { ClubDashboardProfileManager } from "@/app/(site)/club/dashboard/profile/_components/ClubDashboardProfileManager";
import { api } from "@/trpc/server";

export default async function ManageProfilePage() {
  const [profile, affiliations, categories] = await Promise.all([
    api.clubs.getDashboardProfile({}),
    api.masterData.affiliations.getAll({}),
    api.masterData.categories.getAll({}),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-[874px] flex-col items-center gap-8 md:gap-10">
      <div className="flex flex-col items-center text-center">
        <h1 className="font-ibm-plex text-primary text-[24px] leading-[46px] font-bold md:text-[28px]">
          จัดการโปรไฟล์
        </h1>
        <p className="font-ibm-plex text-foreground-secondary text-sm leading-[23px] font-medium md:text-base md:leading-[30px]">
          คุณสามารถจัดการและแก้ไขโปรไฟล์ของคุณได้ที่นี่
        </p>
      </div>

      <ClubDashboardProfileManager
        initialProfile={profile}
        affiliations={affiliations}
        categories={categories}
      />
    </div>
  );
}
