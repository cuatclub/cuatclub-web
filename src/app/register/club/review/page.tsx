import { ClubRegistrationReview } from "@/app/register/club/review/_components/ClubRegistrationReview";
import { ReviewActions } from "@/app/register/club/review/_components/ReviewActions";
import { StepIndicator } from "@/app/register/club/_components/StepIndicator";
import { clubRegistrationStepGuard } from "@/server/guard";
import { api } from "@/trpc/server";

export default async function RegisterReviewPage() {
  const registration = await clubRegistrationStepGuard("INFO_SUBMITTED");
  const club = await api.clubs.getClubRegistrationDetails({});

  return (
    <div className="flex w-full flex-col bg-white">
      <main className="w-full px-5 py-5 md:py-10">
        <div className="mx-auto flex w-full max-w-[874px] flex-col items-center gap-8 md:gap-10">
          <div className="flex flex-col items-center gap-6 md:gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="font-ibm-plex text-primary text-[32px] leading-[53px] font-bold md:text-[40px] md:leading-[66px]">
                กรอกข้อมูลชมรม
              </h1>
              <p className="font-ibm-plex text-foreground text-sm leading-[23px] md:text-lg md:leading-[30px]">
                กรอกรายละเอียดเกี่ยวกับชมรมของคุณให้ครบถ้วน <br className="md:hidden" />
                เพื่อให้ผู้อื่นเข้าใจชมรมได้ง่ายขึ้น
              </p>
            </div>

            <StepIndicator registrationStatus={registration.registrationStatus} />
          </div>

          <ClubRegistrationReview club={club} actions={<ReviewActions clubId={club.id} />} />
        </div>
      </main>
    </div>
  );
}
