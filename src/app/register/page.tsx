"use client";

import { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { User, Users } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  PasswordInput,
} from "@/components";
import { ToggleGroup, ToggleGroupItem } from "@/app/register/_components/ToggleGroup";
import { registerClubSchema, type RegisterClubFormValues } from "./register-schema";

type AccountType = "student" | "club";

export default function Register() {
  // Student is out of scope for this issue — the toggle item stays disabled
  // (see #92 scope) so accountType can only ever settle on "club", but the
  // state stays generic for when student registration ships.
  const [accountType, setAccountType] = useState<AccountType>("club");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterClubFormValues>({ resolver: zodResolver(registerClubSchema) });

  const onSubmit = handleSubmit(() => {
    // TODO(#97/#98): call the register-club API — validates the invitation
    // code against the email via #67 (surfacing CODE_EMAIL_MISMATCH_MESSAGE /
    // EMAIL_ALREADY_USED_MESSAGE via setError on the matching field, same as
    // login-schema.ts's classifyAuthError does for sign-in), then creates the
    // User and an empty, pending Club record.
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
              <fieldset disabled={isSubmitting} className="contents">
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
