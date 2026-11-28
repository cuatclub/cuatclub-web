"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { authClient, signOut } from "@/lib/auth-client";
import { Button, buttonVariants, PasswordInput } from "@/components";
import { toast } from "@/components/ui";
import { GENERIC_ERROR_MESSAGE } from "@/app/(site)/login/login-schema";
import {
  INVALID_LINK_MESSAGE,
  INVALID_TOKEN_CODE,
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/app/(site)/reset-password/reset-password-schema";
import { PasswordCard } from "@/app/(site)/forgot-password/_components/PasswordCard";

export function ResetPasswordForm({ token }: { token: string | undefined }) {
  const router = useRouter();
  const [isLinkInvalid, setIsLinkInvalid] = useState(!token);
  const rootErrorRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({ resolver: zodResolver(resetPasswordSchema) });

  useEffect(() => {
    if (!isSubmitting && errors.root?.message) {
      rootErrorRef.current?.focus();
    }
  }, [isSubmitting, errors.root?.message]);

  const onSubmit = handleSubmit(async ({ password }) => {
    let error: { code?: string } | null;
    try {
      ({ error } = await authClient.resetPassword({ newPassword: password, token }));
    } catch (cause) {
      console.error("[reset-password] request failed", cause);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    if (error?.code === INVALID_TOKEN_CODE) {
      setIsLinkInvalid(true);
      return;
    }

    if (error) {
      console.error("[reset-password] reset rejected", error);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    // The server has revoked every session; this clears any cookie-cached one in this browser.
    await signOut().catch(() => null);
    toast.success("ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบ");
    router.push("/login");
    router.refresh();
  });

  if (isLinkInvalid) {
    return (
      <PasswordCard
        title="ลิงก์ใช้งานไม่ได้"
        description={<span role="alert">{INVALID_LINK_MESSAGE}</span>}
      >
        <Link href="/forgot-password" className={buttonVariants()}>
          ขอลิงก์ใหม่
        </Link>
      </PasswordCard>
    );
  }

  return (
    <PasswordCard title="ตั้งรหัสผ่านใหม่" description="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร">
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <fieldset inert={isSubmitting || undefined} aria-busy={isSubmitting} className="contents">
          <PasswordInput
            label="รหัสผ่านใหม่"
            autoComplete="new-password"
            placeholder="กรอกรหัสผ่านใหม่"
            error={!!errors.password}
            errorMessage={errors.password?.message}
            {...register("password")}
          />
          <PasswordInput
            label="ยืนยันรหัสผ่านใหม่"
            autoComplete="new-password"
            placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
            error={!!errors.confirmPassword}
            errorMessage={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />

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

          <Button type="submit" className="mt-2 w-full" isLoading={isSubmitting}>
            บันทึกรหัสผ่านใหม่
          </Button>
        </fieldset>
      </form>
    </PasswordCard>
  );
}
