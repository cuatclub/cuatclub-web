"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { isTRPCClientError } from "@trpc/client";
import { useForm } from "react-hook-form";
import { User, Users } from "lucide-react";

import { signIn } from "@/lib/auth-client";
import { type AppRouter } from "@/server/api/root";
import { api } from "@/trpc/react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PasswordInput,
} from "@/components";
import { ToggleGroup, ToggleGroupItem } from "@/app/(site)/register/_components/ToggleGroup";
import {
  CODE_EMAIL_MISMATCH_MESSAGE,
  classifyRegisterClubError,
  EMAIL_ALREADY_USED_MESSAGE,
  EMAIL_NOT_INVITED_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  registerClubSchema,
  type RegisterClubFormValues,
} from "@/app/(site)/register/register-schema";

type AccountType = "student" | "club";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = api.clubs.register.useMutation();

  // Student is out of scope for this issue — the toggle item stays disabled
  // (see #92 scope) so accountType can only ever settle on "club", but the
  // state stays generic for when student registration ships.
  const [accountType, setAccountType] = useState<AccountType>("club");
  const rootErrorRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<RegisterClubFormValues>({ resolver: zodResolver(registerClubSchema) });

  // Same accessibility pattern as login/page.tsx — these errors land after
  // RHF's own synchronous pass, from the async submit handler, so screen
  // reader / keyboard users need to be moved there explicitly. Both effects
  // wait for `!isSubmitting` because the fieldset is `disabled` mid-request,
  // and focusing a disabled control is a silent no-op.
  useEffect(() => {
    if (!isSubmitting && errors.root?.message) {
      rootErrorRef.current?.focus();
    }
  }, [isSubmitting, errors.root?.message]);

  useEffect(() => {
    if (!isSubmitting && errors.invitationCode?.type === "manual") {
      setFocus("invitationCode");
    }
  }, [isSubmitting, errors.invitationCode?.type, setFocus]);

  // The code-mismatch branch below sets a manual error on *both* fields but
  // leaves email's message blank (see the comment there) — without the
  // `errors.email.message` guard, this effect would fire in the same commit
  // as the invitationCode one above and, running second, steal focus onto
  // the blank field instead of the one actually carrying the message.
  useEffect(() => {
    if (!isSubmitting && errors.email?.type === "manual" && errors.email.message) {
      setFocus("email");
    }
  }, [isSubmitting, errors.email?.type, errors.email?.message, setFocus]);

  const onSubmit = handleSubmit(async ({ invitationCode, email, password, confirmPassword }) => {
    try {
      await registerMutation.mutateAsync({
        inviteCode: invitationCode,
        email,
        password,
        confirmPassword,
      });
    } catch (cause) {
      const classification = classifyRegisterClubError(
        isTRPCClientError<AppRouter>(cause) ? cause : null
      );

      if (classification === "email-taken") {
        setError("email", { type: "manual", message: EMAIL_ALREADY_USED_MESSAGE });
        return;
      }

      if (classification === "email-not-invited") {
        setError("email", { type: "manual", message: EMAIL_NOT_INVITED_MESSAGE });
        return;
      }

      if (classification === "code-mismatch") {
        // Never reveal which of the two was wrong — mark both, message only once.
        setError("email", { type: "manual", message: "" });
        setError("invitationCode", { type: "manual", message: CODE_EMAIL_MISMATCH_MESSAGE });
        return;
      }

      console.error("[register] club registration failed", cause);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    // clubs.register creates the User via a transaction-scoped better-auth
    // instance (see register-club.usecase.ts) — there's no real HTTP response
    // for it to set a session cookie on, so sign in explicitly here. Mirrors
    // login/page.tsx's own try/catch: signIn.email resolves with `{ error }`
    // for HTTP-level failures but rejects for a network-level one.
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

    router.push("/register/club/profile");
    // force server components to re-render with fresh session
    router.refresh();
  });

  return (
    <div className="flex flex-col bg-white">
      <main className="flex justify-center px-4 py-5 md:py-20">
        <Card className="h-fit w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-primary text-2xl font-bold md:text-3xl">
              <h1>ลงทะเบียน</h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
              <fieldset
                inert={isSubmitting || undefined}
                aria-busy={isSubmitting}
                className="contents"
              >
                <div className="flex flex-col gap-2">
                  <p
                    id="account-type-label"
                    className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
                  >
                    คุณต้องการลงทะเบียนเป็น
                  </p>
                  <ToggleGroup
                    type="single"
                    value={accountType}
                    onValueChange={(value) => value && setAccountType(value as AccountType)}
                    aria-labelledby="account-type-label"
                    className="w-full"
                  >
                    <ToggleGroupItem value="student" disabled className="flex-1">
                      <User aria-hidden="true" />
                      นักศึกษา
                    </ToggleGroupItem>
                    <ToggleGroupItem value="club" className="flex-1">
                      <Users aria-hidden="true" />
                      ชมรม
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <p className="border-primary-light bg-primary-lighter/30 text-primary rounded-lg border border-dashed px-3 py-4 text-center text-xs md:text-sm">
                  หากต้องการสร้างแอคเคาท์ชมรม กรุณาติดต่อขอรหัสเชิญ <br /> จากแอดมินผ่านทางไอจี
                  @cuatclub.chula
                </p>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <label
                      htmlFor="invitationCode"
                      className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
                    >
                      รหัสเชิญ <span className="text-error">*</span>
                    </label>
                    <Input
                      id="invitationCode"
                      placeholder="กรอกรหัสเชิญ"
                      autoComplete="off"
                      error={!!errors.invitationCode}
                      errorMessage={errors.invitationCode?.message}
                      {...register("invitationCode")}
                    />
                  </div>

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

                <p className="text-foreground-secondary text-center text-sm font-medium">
                  มีบัญชีอยู่แล้ว?{" "}
                  <Link href="/login" className="text-primary font-medium">
                    เข้าสู่ระบบ
                  </Link>
                </p>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
