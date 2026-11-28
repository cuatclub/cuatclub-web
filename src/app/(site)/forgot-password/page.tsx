"use client";

import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { MailCheck } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button, Input } from "@/components";
import { GENERIC_ERROR_MESSAGE } from "@/app/(site)/login/login-schema";
import { RESET_PASSWORD_PATH } from "@/app/(site)/reset-password/reset-password-schema";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
  describeForgotPasswordError,
} from "./forgot-password-schema";
import { PasswordCard } from "./_components/PasswordCard";

export default function ForgotPassword() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const rootErrorRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({ resolver: zodResolver(forgotPasswordSchema) });

  useEffect(() => {
    if (!isSubmitting && errors.root?.message) {
      rootErrorRef.current?.focus();
    }
  }, [isSubmitting, errors.root?.message]);

  const onSubmit = handleSubmit(async ({ email }) => {
    let error: { status?: number; code?: string } | null;
    try {
      ({ error } = await authClient.requestPasswordReset({
        email,
        redirectTo: RESET_PASSWORD_PATH,
      }));
    } catch (cause) {
      console.error("[forgot-password] request failed", cause);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    if (error) {
      console.error("[forgot-password] request rejected", error);
      const { field, message } = describeForgotPasswordError(error);
      setError(field, { type: "manual", message });
      return;
    }

    setSentTo(email);
  });

  if (sentTo) {
    return (
      <PasswordCard
        icon={MailCheck}
        title="ส่งอีเมลแล้ว"
        description={
          <span role="status">
            เราได้ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่
            <span className="text-foreground block text-base font-semibold break-words">
              {sentTo.slice(0, sentTo.indexOf("@"))}
              {/* Lets a long address wrap before the domain. */}
              <wbr />
              {sentTo.slice(sentTo.indexOf("@"))}
            </span>
          </span>
        }
      >
        <p className="bg-primary-lighter/40 text-primary rounded-lg px-4 py-3 text-center text-sm leading-6">
          ลิงก์จะหมดอายุใน 1 ชั่วโมง
          <br />
          ไม่พบอีเมล? ลองดูในโฟลเดอร์สแปม
        </p>
      </PasswordCard>
    );
  }

  return (
    <PasswordCard
      title="ลืมรหัสผ่าน"
      description={
        <>
          กรอกอีเมลที่ใช้ลงทะเบียน
          <br />
          เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
        <fieldset inert={isSubmitting || undefined} aria-busy={isSubmitting} className="contents">
          <Input
            label="อีเมล"
            type="email"
            autoComplete="email"
            placeholder="example@gmail.com"
            error={!!errors.email}
            errorMessage={errors.email?.message}
            {...register("email")}
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
            ส่งลิงก์ตั้งรหัสผ่านใหม่
          </Button>
        </fieldset>
      </form>
    </PasswordCard>
  );
}
