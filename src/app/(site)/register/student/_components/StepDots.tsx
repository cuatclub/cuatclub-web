import { cn } from "@/lib/utils";

const TOTAL_STEPS = 3;

/** Progress dots under each student step card. `step` is 1-based. */
export function StepDots({ step }: { step: number }) {
  return (
    <div
      role="img"
      aria-label={`ขั้นตอนที่ ${step} จาก ${TOTAL_STEPS}`}
      className="flex items-center justify-center gap-1.5"
    >
      {Array.from({ length: TOTAL_STEPS }, (_, index) => (
        <span
          key={index}
          className={cn("size-2 rounded-full", index + 1 === step ? "bg-primary" : "bg-border")}
        />
      ))}
    </div>
  );
}
