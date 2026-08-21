import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClubOutputDTO } from "@/server/api/modules/clubs/dto/club.dto";

type RegistrationStatus = ClubOutputDTO["registrationStatus"];

const STEPS = ["สร้างบัญชี", "กรอกข้อมูลชมรม", "เสร็จสิ้น"] as const;

const STATUS_STEP_INDEX: Record<RegistrationStatus, number> = {
  PENDING: 0,
  INFO_SUBMITTED: 1,
  COMPLETED: 2,
};

type StepIndicatorProps = {
  registrationStatus: RegistrationStatus;
};

export function StepIndicator({ registrationStatus }: StepIndicatorProps) {
  const currentIndex = STATUS_STEP_INDEX[registrationStatus];

  return (
    <div className="border-border flex w-full max-w-full items-center gap-2 rounded-lg border px-4 py-3 md:gap-2 md:px-6 md:py-4">
      {STEPS.map((label, index) => {
        const isDone = index <= currentIndex;

        return (
          <div key={label} className="flex min-w-0 shrink items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full md:h-6 md:w-6",
                  isDone ? "bg-success" : "bg-placeholder"
                )}
              >
                {isDone && (
                  <Check className="h-3.5 w-3.5 text-white md:h-4 md:w-4" strokeWidth={2} />
                )}
              </span>
              <span
                className={cn(
                  "font-ibm-plex truncate text-xs font-medium md:text-base",
                  isDone ? "text-foreground-secondary" : "text-placeholder"
                )}
              >
                {label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <span className="border-placeholder h-0 w-4 shrink border-t-2 md:w-[42px]" />
            )}
          </div>
        );
      })}
    </div>
  );
}
