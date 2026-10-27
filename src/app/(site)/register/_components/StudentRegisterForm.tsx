"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { isTRPCClientError } from "@trpc/client";
import { useForm } from "react-hook-form";

import { signIn } from "@/lib/auth-client";
import { type AppRouter } from "@/server/api/root";
import { api } from "@/trpc/react";
import { Button, GoogleSignInSection, Input, PasswordInput } from "@/components";
import {
  EMAIL_ALREADY_USED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
} from "@/app/(site)/register/register-schema";
import {
  classifyRegisterStudentError,
  registerStudentSchema,
  type RegisterStudentFormValues,
} from "@/app/(site)/register/register-student-schema";

// A brand-new account resolves to the first step; an existing Google account that already
// finished registering resolves home, so both flows can share this one entry point.
const FIRST_STEP_PATH = "/register/student";

export function StudentRegisterForm() {
  const router = useRouter();
  const registerMutation = api.students.register.useMutation();

  const rootErrorRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<RegisterStudentFormValues>({ resolver: zodResolver(registerStudentSchema) });

  // Same accessibility pattern as ClubRegisterForm — wait for `!isSubmitting` because the
  // fieldset is inert mid-request and focusing an inert control is a silent no-op.
  useEffect(() => {
    if (!isSubmitting && errors.root?.message) {
      rootErrorRef.current?.focus();
    }
  }, [isSubmitting, errors.root?.message]);

  useEffect(() => {
    if (!isSubmitting && errors.email?.type === "manual") {
      setFocus("email");
    }
  }, [isSubmitting, errors.email?.type, setFocus]);

  const onSubmit = handleSubmit(async ({ email, password, confirmPassword }) => {
    try {
      await registerMutation.mutateAsync({ email, password, confirmPassword });
    } catch (cause) {
      const classification = classifyRegisterStudentError(
        isTRPCClientError<AppRouter>(cause) ? cause : null
      );

      if (classification === "email-taken") {
        setError("email", { type: "manual", message: EMAIL_ALREADY_USED_MESSAGE });
        return;
      }

      console.error("[register] student registration failed", cause);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    // students.register creates the User through a transaction-scoped better-auth instance
    // (see register-student.usecase.ts), which can't set a session cookie — sign in explicitly.
    // signIn.email resolves with `{ error }` for HTTP-level failures but rejects for a
    // network-level one, hence both branches.
    let signInError: { code?: string; message?: string } | null;
    try {
      ({ error: signInError } = await signIn.email({ email, password }));
    } catch (cause) {
      console.error("[register] post-registration sign-in request failed", cause);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    if (signInError) {
      console.error("[register] post-registration sign-in failed", signInError);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    router.push(FIRST_STEP_PATH);
    // force server components to re-render with fresh session
    router.refresh();
  });

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      <fieldset inert={isSubmitting || undefined} aria-busy={isSubmitting} className="contents">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label
              htmlFor="email"
              className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
            >
              อีเมล <span className="text-error">*</span>
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="example@gmail.com"
              error={!!errors.email}
              errorMessage={errors.email?.message}
              {...register("email")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="password"
              className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
            >
              รหัสผ่าน <span className="text-error">*</span>
            </label>
            <PasswordInput
              id="password"
              autoComplete="new-password"
              placeholder="กรอกรหัสผ่าน"
              error={!!errors.password}
              errorMessage={errors.password?.message}
              {...register("password")}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="confirmPassword"
              className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
            >
              ยืนยันรหัสผ่าน <span className="text-error">*</span>
            </label>
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
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

        <GoogleSignInSection
          callbackURL={FIRST_STEP_PATH}
          onError={() => setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE })}
        />

        <p className="text-foreground-secondary text-center text-sm font-medium">
          มีบัญชีอยู่แล้ว?{" "}
          <Link href="/login" className="text-primary font-medium">
            เข้าสู่ระบบ
          </Link>
        </p>
      </fieldset>
    </form>
  );
}
