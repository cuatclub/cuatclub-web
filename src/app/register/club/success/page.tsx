import { Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STEPS = ["สร้างบัญชี", "กรอกข้อมูลชมรม", "เสร็จสิ้น"];

function StepIndicator() {
  return (
    <div className="border-border flex w-full max-w-full items-center gap-2 rounded-lg border px-4 py-3 md:gap-2 md:px-6 md:py-4">
      {STEPS.map((label, index) => (
        <div key={label} className="flex min-w-0 shrink items-center gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="bg-success flex h-5 w-5 shrink-0 items-center justify-center rounded-full md:h-6 md:w-6">
              <Check className="h-3.5 w-3.5 text-white md:h-4 md:w-4" strokeWidth={2} />
            </span>
            <span className="font-ibm-plex text-foreground-secondary truncate text-xs font-medium md:text-base">
              {label}
            </span>
          </div>
          {index < STEPS.length - 1 && (
            <span className="border-placeholder h-0 w-4 shrink border-t-2 md:w-[42px]" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ClubRegisterSuccess() {
  return (
    <div className="flex flex-col bg-white">
      <main className="flex flex-col px-5 py-5 md:py-10">
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

            <StepIndicator />
          </div>

          <Image
            src="/svg/register_success.svg"
            alt=""
            width={288}
            height={240}
            className="h-[200px] w-60 md:h-60 md:w-72"
          />

          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "primary" }), "w-60 md:w-[300px]")}
          >
            แดชบอร์ด
          </Link>
        </div>
      </main>
    </div>
  );
}
