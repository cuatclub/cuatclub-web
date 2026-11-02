import Image from "next/image";
import { ArrowLeftRight, Check } from "lucide-react";

import { ConnectLineActions } from "@/app/(site)/register/student/line/_components";
import { getLineConnectErrorMessage } from "@/app/(site)/register/student/line/_lib/line-connect-error";
import { Card } from "@/components/ui/Card";
import { env } from "@/config/env";
import { studentLineConnectGuard } from "@/server/guard";

const NOTIFICATION_EXAMPLES = [
  "ชมรมที่คุณติดตาม โพสต์กิจกรรมใหม่",
  "กิจกรรมที่คุณบันทึกไว้ ใกล้หมดเวลารับสมัคร",
  "มีกิจกรรมที่ตรงกับความสนใจของคุณ",
];

type StudentLineConnectPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function StudentLineConnectPage({
  searchParams,
}: StudentLineConnectPageProps) {
  const { isLineConnected } = await studentLineConnectGuard();
  const { error } = await searchParams;

  return (
    <div className="flex w-full flex-col bg-white">
      <main className="w-full p-5 md:py-20">
        <Card className="mx-auto w-full max-w-[480px] px-6">
          <div className="flex items-center justify-center gap-5">
            <div className="bg-primary flex size-12 items-center justify-center rounded-xl p-2 md:size-14">
              <Image
                src="/svg/logo-white.svg"
                alt="CUatClub"
                width={97}
                height={49}
                className="h-auto w-full"
              />
            </div>
            <ArrowLeftRight aria-hidden="true" className="text-placeholder size-6 shrink-0" />
            <Image
              src="/images/line-icon.png"
              alt="LINE"
              width={56}
              height={56}
              className="size-12 md:size-14"
            />
          </div>

          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-primary text-xl leading-[33px] font-bold md:text-2xl md:leading-10">
              {isLineConnected ? "เชื่อมต่อ LINE เรียบร้อยแล้ว" : "เชื่อมบัญชีกับ LINE"}
            </h1>
            <p className="text-foreground-muted text-sm leading-[23px] font-medium md:text-base md:leading-[26px]">
              {isLineConnected ? (
                "หากยังไม่ได้เพิ่ม CUatClub เป็นเพื่อน กรุณาเพิ่มเพื่อนเพื่อรับการแจ้งเตือน"
              ) : (
                <>
                  รับการแจ้งเตือนกิจกรรม และชมรมที่คุณสนใจผ่าน LINE{" "}
                  <br className="hidden md:inline" />
                  เพื่อไม่ให้พลาดโอกาสสำคัญจากชมรมที่คุณติดตาม
                </>
              )}
            </p>
          </div>

          {!isLineConnected && (
            <>
              <hr className="border-border" />
              <div className="flex flex-col gap-3">
                <h2 className="text-sm leading-[23px] font-semibold md:text-base md:leading-[26px]">
                  CUatClub จะสามารถแจ้งเตือนเมื่อ
                </h2>
                <ul className="flex flex-col gap-2">
                  {NOTIFICATION_EXAMPLES.map((text) => (
                    <li key={text} className="flex items-center gap-2">
                      <span className="border-placeholder flex size-4 shrink-0 items-center justify-center rounded-full border-[1.5px] bg-white">
                        {/* 3.2 on lucide's 24-unit grid is the design's 1.33px stroke at 10px. */}
                        <Check
                          aria-hidden="true"
                          className="text-placeholder"
                          size={10}
                          strokeWidth={3.2}
                        />
                      </span>
                      <span className="text-foreground-muted text-xs leading-5 md:text-sm md:leading-[23px]">
                        {text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}

          <ConnectLineActions
            isConnected={isLineConnected}
            addFriendUrl={env.LINE_OA_ADD_FRIEND_URL}
            nextHref="/"
            initialErrorMessage={isLineConnected ? null : getLineConnectErrorMessage(error)}
          />
        </Card>
      </main>
    </div>
  );
}
