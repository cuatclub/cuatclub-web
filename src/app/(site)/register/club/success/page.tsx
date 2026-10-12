import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { clubRegistrationStepGuard } from "@/server/guard";
import { StepIndicator } from "@/app/(site)/register/club/_components/StepIndicator";

export default async function ClubRegisterSuccess() {
  const club = await clubRegistrationStepGuard("COMPLETED");

  return (
    <div className="flex w-full flex-col bg-white">
      <main className="w-full px-5 pt-5 pb-8 md:pt-10 md:pb-16">
        <div className="mx-auto flex w-full max-w-[622px] flex-col items-center gap-6 md:gap-16">
          <div className="flex flex-col items-center gap-6 md:gap-8">
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="font-ibm-plex text-primary text-[32px] leading-[53px] font-bold md:text-[40px] md:leading-[66px]">
                ลงทะเบียนสำเร็จ 🎉
              </h1>
              <p className="font-ibm-plex text-foreground text-sm leading-[23px] md:text-lg md:leading-[30px]">
                คุณได้ลงทะเบียนเป็นชมรมเรียบร้อย คุณสามารถแก้ไขข้อมูลได้ผ่านหน้าแดชบอร์ด
              </p>
            </div>

            <StepIndicator registrationStatus={club.registrationStatus} />
          </div>

          <Image
            src="/svg/register_success.svg"
            alt=""
            width={288}
            height={240}
            className="h-[200px] w-60 md:h-60 md:w-72"
          />

          <Link href="/" className={cn(buttonVariants(), "w-60 md:w-[300px]")}>
            กลับหน้าแรก
          </Link>
        </div>
      </main>
    </div>
  );
}
