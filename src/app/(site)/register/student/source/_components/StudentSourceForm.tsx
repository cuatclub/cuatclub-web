"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";

import { api } from "@/trpc/react";
import { Button, RadioGroup, Textarea } from "@/components";
import {
  GENERIC_ERROR_MESSAGE,
  REFERRAL_SOURCE_OPTIONS,
  studentSourceSchema,
  type StudentSourceFormValues,
} from "@/app/(site)/register/student/student-source-schema";

interface StudentSourceFormProps {
  existing: {
    referralSource: StudentSourceFormValues["source"] | null;
    referralOther: string | null;
  };
}

export function StudentSourceForm({ existing }: StudentSourceFormProps) {
  const router = useRouter();
  const saveMutation = api.students.saveReferralSource.useMutation();
  const rootErrorRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<StudentSourceFormValues>({
    resolver: zodResolver(studentSourceSchema),
    defaultValues: {
      // `undefined` rather than null so no radio starts selected.
      source: existing.referralSource ?? undefined,
      other: existing.referralOther ?? "",
    },
  });

  const source = watch("source");
  const other = watch("other");

  useEffect(() => {
    if (!isSubmitting && errors.root?.message) {
      rootErrorRef.current?.focus();
    }
  }, [isSubmitting, errors.root?.message]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await saveMutation.mutateAsync({
        source: values.source,
        other: values.source === "OTHER" ? values.other : undefined,
      });
    } catch (cause) {
      console.error("[register] student referral source failed", cause);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    router.push("/register/student/line");
    // force server components to re-render with fresh registration status
    router.refresh();
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      <fieldset inert={isSubmitting || undefined} aria-busy={isSubmitting} className="contents">
        <div className="flex flex-col gap-3">
          <Controller
            control={control}
            name="source"
            render={({ field }) => (
              <RadioGroup
                name={field.name}
                orientation="vertical"
                options={[...REFERRAL_SOURCE_OPTIONS]}
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== "OTHER") setValue("other", "");
                }}
                error={!!errors.source}
                errorMessage={errors.source?.message}
              />
            )}
          />

          {source === "OTHER" && (
            <Textarea
              aria-label="ช่องทางที่คุณรู้จักเรา"
              placeholder="บอกเราหน่อยว่าคุณรู้จักเราผ่านช่องทางไหน?"
              rows={3}
              error={!!errors.other}
              errorMessage={errors.other?.message}
              {...register("other")}
            />
          )}
        </div>

        {errors.root?.message && (
          <p
            ref={rootErrorRef}
            tabIndex={-1}
            role="alert"
            className="text-error text-center text-sm"
          >
            {errors.root.message}
          </p>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={isSubmitting}
          disabled={!source || (source === "OTHER" && !other?.trim())}
        >
          ยืนยัน
        </Button>
      </fieldset>
    </form>
  );
}
