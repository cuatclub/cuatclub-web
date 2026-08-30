"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { isTRPCClientError } from "@trpc/client";
import { Plus } from "lucide-react";

import { api } from "@/trpc/react";
import type { AppRouter } from "@/server/api/root";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Input,
} from "@/components";
import {
  editAffiliationSchema,
  GENERIC_ERROR_MESSAGE,
  type EditAffiliationFormValues,
} from "@/app/admin/master-data/_components/master-data-schema";

export function CreateAffiliationDialog() {
  const [open, setOpen] = useState(false);
  const utils = api.useUtils();
  const mutation = api.masterData.affiliations.create.useMutation();
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditAffiliationFormValues>({
    resolver: zodResolver(editAffiliationSchema),
    defaultValues: { label: "" },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    setRootError(null);
    reset({ label: "" });
  };

  const onSubmit = handleSubmit(async (values) => {
    setRootError(null);
    try {
      await mutation.mutateAsync(values);
      await utils.masterData.affiliations.getAll.invalidate();
      handleOpenChange(false);
    } catch (cause) {
      console.error("[admin/master-data] create affiliation failed", cause);
      const trpcError = isTRPCClientError<AppRouter>(cause) ? cause : null;
      setRootError(
        trpcError?.data?.code === "CONFLICT"
          ? "ชื่อหน่วยงานสังกัดนี้ถูกใช้แล้ว"
          : GENERIC_ERROR_MESSAGE
      );
    }
  });

  return (
    <DialogRoot open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus aria-hidden="true" className="size-4" />
          เพิ่มหน่วยงานสังกัด
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-6 p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <DialogTitle>เพิ่มหน่วยงานสังกัด</DialogTitle>
          <DialogDescription>สร้างหน่วยงานสังกัดใหม่</DialogDescription>
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
              เพิ่มหน่วยงานสังกัด
            </Button>
          </fieldset>
        </form>
      </DialogContent>
    </DialogRoot>
  );
}
