"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";

export function ReviewActions() {
  const router = useRouter();

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
      <Button
        type="button"
        variant="outline"
        className="w-full sm:w-1/4"
        onClick={() => router.push("/register/club/profile")}
      >
        ย้อนกลับ
      </Button>
      <Button
        type="button"
        className="w-full sm:w-1/4"
        onClick={() => router.push("/register/club/success")}
      >
        ยืนยัน
      </Button>
    </div>
  );
}
