"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isTRPCClientError } from "@trpc/client";

import { api, type RouterOutputs } from "@/trpc/react";
import type { AppRouter } from "@/server/api/root";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  Input,
} from "@/components";
import {
  editAffiliationSchema,
  GENERIC_ERROR_MESSAGE,
  type EditAffiliationFormValues,
} from "@/app/admin/master-data/_components/master-data-schema";

type Affiliation = RouterOutputs["masterData"]["affiliations"]["getAll"][number];

type EditAffiliationDialogProps = {
  affiliation: Affiliation | null;
  onClose: () => void;
};

export function EditAffiliationDialog({ affiliation, onClose }: EditAffiliationDialogProps) {
  const utils = api.useUtils();
  const mutation = api.masterData.affiliations.update.useMutation();
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditAffiliationFormValues>({
    resolver: zodResolver(editAffiliationSchema),
    values: affiliation ? { label: affiliation.label } : undefined,
  });

  const handleClose = () => {
    reset();
    setRootError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!affiliation) return;

    setRootError(null);
    try {
      await mutation.mutateAsync({ id: affiliation.id, ...values });
      await utils.masterData.affiliations.getAll.invalidate();
      handleClose();
    } catch (cause) {
      console.error("[admin/master-data] update affiliation failed", cause);
      const trpcError = isTRPCClientError<AppRouter>(cause) ? cause : null;
      setRootError(
        trpcError?.data?.code === "CONFLICT"
          ? "ชื่อหน่วยงานสังกัดนี้ถูกใช้แล้ว"
          : GENERIC_ERROR_MESSAGE
      );
    }
  });

  return (
    <DialogRoot open={!!affiliation} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <DialogTitle>แก้ไขหน่วยงานสังกัด</DialogTitle>
          <DialogDescription>เปลี่ยนชื่อหน่วยงานสังกัดนี้</DialogDescription>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <Input
              label="ชื่อหน่วยงานสังกัด"
              error={!!errors.label}
              errorMessage={errors.label?.message}
              {...register("label")}
            />

            {rootError && (
              <p role="alert" className="text-error text-sm">
                {rootError}
              </p>
            )}

            <Button type="submit" className="w-full" isLoading={isSubmitting}>
              บันทึก
            </Button>
          </fieldset>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
