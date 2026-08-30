"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { isTRPCClientError } from "@trpc/client";
import { Shuffle } from "lucide-react";

import { api, type RouterOutputs } from "@/trpc/react";
import type { AppRouter } from "@/server/api/root";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  Input,
  Tag,
} from "@/components";
import { pickRandomColorPreset } from "@/app/admin/master-data/_components/color-presets";
import { ColorField } from "@/app/admin/master-data/_components/ColorField";
import {
  editCategorySchema,
  GENERIC_ERROR_MESSAGE,
  type EditCategoryFormValues,
} from "@/app/admin/master-data/_components/master-data-schema";

type Category = RouterOutputs["masterData"]["categories"]["getAll"][number];

type EditCategoryDialogProps = {
  category: Category | null;
  onClose: () => void;
};

export function EditCategoryDialog({ category, onClose }: EditCategoryDialogProps) {
  const utils = api.useUtils();
  const { data: categories } = api.masterData.categories.getAll.useQuery({});
  const mutation = api.masterData.categories.update.useMutation();
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<EditCategoryFormValues>({
    resolver: zodResolver(editCategorySchema),
    values: category
      ? {
          label: category.label,
          fontColor: category.fontColor,
          backgroundColor: category.backgroundColor,
        }
      : undefined,
  });

  const fontColor = watch("fontColor");
  const backgroundColor = watch("backgroundColor");
  const label = watch("label");

  const handleClose = () => {
    reset();
    setRootError(null);
    onClose();
  };

  const handleRandomize = () => {
    const otherCategories = (categories ?? []).filter((c) => c.id !== category?.id);
    const preset = pickRandomColorPreset(otherCategories);
    setValue("fontColor", preset.fontColor, { shouldDirty: true });
    setValue("backgroundColor", preset.backgroundColor, { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (values) => {
    if (!category) return;

    setRootError(null);
    try {
      await mutation.mutateAsync({ id: category.id, ...values });
      await utils.masterData.categories.getAll.invalidate();
      handleClose();
    } catch (cause) {
      console.error("[admin/master-data] update category failed", cause);
      const trpcError = isTRPCClientError<AppRouter>(cause) ? cause : null;
      setRootError(
        trpcError?.data?.code === "CONFLICT" ? "ชื่อหมวดหมู่นี้ถูกใช้แล้ว" : GENERIC_ERROR_MESSAGE
      );
    }
  });

  return (
    <DialogRoot open={!!category} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="gap-6 overflow-y-auto p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <DialogTitle>แก้ไขหมวดหมู่</DialogTitle>
          <DialogDescription>เปลี่ยนชื่อหรือสีของหมวดหมู่นี้</DialogDescription>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
          <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
            <Input
              label="ชื่อหมวดหมู่"
              error={!!errors.label}
              errorMessage={errors.label?.message}
              {...register("label")}
            />

            <div className="flex items-center justify-between">
              <p className="font-ibm-plex text-foreground text-sm font-medium md:text-base">สี</p>
              <Button type="button" variant="outline" className="gap-2" onClick={handleRandomize}>
                <Shuffle aria-hidden="true" className="size-4" />
                สุ่มสี
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Controller
                control={control}
                name="fontColor"
                render={({ field }) => (
                  <ColorField
                    label="สีตัวอักษร"
                    error={errors.fontColor?.message}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
              <Controller
                control={control}
                name="backgroundColor"
                render={({ field }) => (
                  <ColorField
                    label="สีพื้นหลัง"
                    error={errors.backgroundColor?.message}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-center py-2">
              <Tag color={fontColor} bgColor={backgroundColor}>
                {label || "ตัวอย่าง"}
              </Tag>
            </div>

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
