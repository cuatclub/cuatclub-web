"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/Button";
import { api } from "@/trpc/react";

type ReviewActionsProps = {
  clubId: string;
};

export function ReviewActions({ clubId }: ReviewActionsProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string>();
  const reopenProfile = api.clubs.reopenClubProfileRegistration.useMutation();
  const submitRegistration = api.clubs.submitClubProfileRegistration.useMutation();
  const isPending = reopenProfile.isPending || submitRegistration.isPending;

  const handleBack = async () => {
    setErrorMessage(undefined);
    try {
      const result = await reopenProfile.mutateAsync({});
      if (result.registrationStatus !== "PENDING")
        throw new Error("Unexpected registration status");
      router.push("/register/club/profile");
      router.refresh();
    } catch {
      setErrorMessage("ไม่สามารถย้อนกลับไปแก้ไขข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  const handleConfirm = async () => {
    setErrorMessage(undefined);
    try {
      const result = await submitRegistration.mutateAsync({ id: clubId });
      if (result.registrationStatus !== "COMPLETED") {
        throw new Error("Unexpected registration status");
      }
      router.push("/register/club/success");
      router.refresh();
    } catch {
      setErrorMessage("ไม่สามารถยืนยันข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-1/4"
          disabled={isPending}
          isLoading={reopenProfile.isPending}
          onClick={handleBack}
        >
          ย้อนกลับ
        </Button>
        <Button
          type="button"
          className="w-full sm:w-1/4"
          disabled={isPending}
          isLoading={submitRegistration.isPending}
          onClick={handleConfirm}
        >
          ยืนยัน
        </Button>
      </div>
      {errorMessage && (
        <p role="alert" className="font-ibm-plex text-error text-sm leading-[23px]">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
