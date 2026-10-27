"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { isTRPCClientError } from "@trpc/client";
import { Controller, useForm } from "react-hook-form";

import { type AppRouter } from "@/server/api/root";
import { api } from "@/trpc/react";
import { Button, Input, RadioGroup, Select } from "@/components";
import {
  classifyStudentGeneralError,
  FACULTY_REQUIRED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  parseYearLabel,
  STUDENT_STATUS_OPTIONS,
  studentGeneralSchema,
  type StudentGeneralFormValues,
  USERNAME_TAKEN_MESSAGE,
  YEAR_OPTIONS,
  yearLabel,
} from "@/app/(site)/register/student/student-general-schema";

interface StudentGeneralFormProps {
  faculties: { id: number; label: string }[];
  existing: {
    status: "CHULA" | "OTHER_UNIVERSITY" | null;
    username: string | null;
    facultyId: number | null;
    yearLevel: number | null;
    university: string | null;
  };
}

const labelClass =
  "font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]";

export function StudentGeneralForm({ faculties, existing }: StudentGeneralFormProps) {
  const router = useRouter();
  const saveMutation = api.students.saveGeneralInfo.useMutation();
  const rootErrorRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<StudentGeneralFormValues>({
    resolver: zodResolver(studentGeneralSchema),
    defaultValues: {
      status: existing.status ?? "CHULA",
      username: existing.username ?? "",
      faculty: faculties.find((faculty) => faculty.id === existing.facultyId)?.label ?? "",
      year: existing.yearLevel ? yearLabel(existing.yearLevel) : "",
      university: existing.university ?? "",
    },
  });

  const status = watch("status");

  // Same accessibility pattern as register/_components/ClubRegisterForm.tsx — these errors land
  // after RHF's synchronous pass, and focusing the inert fieldset mid-request is a no-op, so wait
  // for `!isSubmitting`.
  useEffect(() => {
    if (!isSubmitting && errors.root?.message) {
      rootErrorRef.current?.focus();
    }
  }, [isSubmitting, errors.root?.message]);

  useEffect(() => {
    if (!isSubmitting && errors.username?.type === "manual") {
      setFocus("username");
    }
  }, [isSubmitting, errors.username?.type, setFocus]);

  const onSubmit = handleSubmit(async ({ status, username, faculty, year, university }) => {
    const facultyId = faculties.find((item) => item.label === faculty)?.id;
    if (facultyId === undefined) {
      setError("faculty", { type: "manual", message: FACULTY_REQUIRED_MESSAGE });
      return;
    }

    try {
      await saveMutation.mutateAsync({
        status,
        username,
        facultyId,
        yearLevel: parseYearLabel(year),
        university: status === "OTHER_UNIVERSITY" ? university : undefined,
      });
    } catch (cause) {
      const classification = classifyStudentGeneralError(
        isTRPCClientError<AppRouter>(cause) ? cause : null
      );

      if (classification === "username-taken") {
        setError("username", { type: "manual", message: USERNAME_TAKEN_MESSAGE });
        return;
      }

      console.error("[register] student general info failed", cause);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    router.push("/register/student/preference");
    // force server components to re-render with fresh registration status
    router.refresh();
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      <fieldset inert={isSubmitting || undefined} aria-busy={isSubmitting} className="contents">
        <div className="flex flex-col gap-4">
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <RadioGroup
                label="สถานะ"
                required
                name={field.name}
                options={[...STUDENT_STATUS_OPTIONS]}
                value={field.value}
                onValueChange={field.onChange}
                error={!!errors.status}
                errorMessage={errors.status?.message}
              />
            )}
          />

          <div className="flex flex-col gap-1">
            <label htmlFor="username" className={labelClass}>
              ชื่อผู้ใช้ <span className="text-error">*</span>
            </label>
            <Input
              id="username"
              autoComplete="username"
              placeholder="john.doe"
              error={!!errors.username}
              errorMessage={errors.username?.message}
              {...register("username")}
            />
          </div>

          {status === "OTHER_UNIVERSITY" && (
            <div className="flex flex-col gap-1">
              <label htmlFor="university" className={labelClass}>
                มหาลัย <span className="text-error">*</span>
              </label>
              <Input
                id="university"
                autoComplete="off"
                placeholder="กรอกชื่อมหาลัย"
                error={!!errors.university}
                errorMessage={errors.university?.message}
                {...register("university")}
              />
            </div>
          )}

          <Controller
            control={control}
            name="faculty"
            render={({ field }) => (
              <Select
                label="คณะ"
                required
                placeholder="เลือกคณะ"
                name={field.name}
                options={faculties.map((faculty) => faculty.label)}
                value={field.value}
                onValueChange={field.onChange}
                error={!!errors.faculty}
                errorMessage={errors.faculty?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="year"
            render={({ field }) => (
              <Select
                label="ชั้นปี"
                required
                placeholder="เลือกชั้นปี"
                name={field.name}
                options={YEAR_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                error={!!errors.year}
                errorMessage={errors.year?.message}
              />
            )}
          />
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

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          ถัดไป
        </Button>
      </fieldset>
    </form>
  );
}
