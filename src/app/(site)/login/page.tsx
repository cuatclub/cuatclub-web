"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { getSession, signIn } from "@/lib/auth-client";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Input,
  PasswordInput,
} from "@/components";
import {
  classifyAuthError,
  GENERIC_ERROR_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
  type LoginFormValues,
  loginSchema,
} from "./login-schema";

export default function Login() {
  const router = useRouter();
  const [rememberMe, setRememberMe] = useState(false);
  const rootErrorRef = useRef<HTMLParagraphElement>(null);

  const {
    register,
    handleSubmit,
    setError,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  // setFocus only covers RHF's own synchronous validation pass — these errors
  // are set later, from the async submit handler, so screen reader / keyboard
  // users need to be moved there explicitly once the alert actually mounts.
  //
  // Both effects wait for `!isSubmitting`: while the request is in flight the
  // fieldset below is still `disabled`, and focusing a disabled control is a
  // silent no-op — calling setFocus synchronously inside onSubmit (before the
  // handler returns and isSubmitting flips back to false) never actually
  // moved focus.
  useEffect(() => {
    if (!isSubmitting && errors.root?.message) {
      rootErrorRef.current?.focus();
    }
  }, [isSubmitting, errors.root?.message]);

  useEffect(() => {
    if (!isSubmitting && errors.password?.type === "manual") {
      setFocus("password");
    }
  }, [isSubmitting, errors.password?.type, setFocus]);

  const onSubmit = handleSubmit(async ({ email, password }) => {
    // signIn.email normally *resolves* to { error } for HTTP-level failures
    // (bad credentials, 500, ...), but a network-level failure (offline, DNS,
    // CORS) makes the underlying fetch reject instead — without this
    // try/catch that throw would escape handleSubmit uncaught and the user
    // would see the button just go back to normal with no explanation.
    let error: { code?: string; message?: string } | null;
    try {
      ({ error } = await signIn.email({ email, password, rememberMe }));
    } catch (cause) {
      console.error("[login] sign-in request failed", cause);
      setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
      return;
    }

    const classification = classifyAuthError(error);

    if (classification === null) {
      // /register/club/profile is guarded by clubRegistrationStepGuard, which
      // routes CLUB users to whichever step actually matches their
      // registrationStatus. Other roles have no club row to gate on, so
      // they'd just get bounced home by the guard — send them there directly.
      try {
        const { data } = await getSession();
        router.push(data?.user.role === "CLUB" ? "/register/club/profile" : "/");
      } catch (cause) {
        console.error("[login] session lookup failed", cause);
        router.push("/");
      }
      // force server components to re-render with fresh session
      router.refresh();
      return;
    }

    if (classification === "invalid-credentials") {
      // Never reveal which field was wrong — mark both, message only once.
      setError("email", { type: "manual", message: "" });
      setError("password", { type: "manual", message: INVALID_CREDENTIALS_MESSAGE });
      return;
    }

    // Anything else — rate limiting, a 500, ... — isn't a credentials
    // problem. Don't blame the password for it; log the real cause for
    // debugging and show a generic message instead.
    console.error("[login] sign-in failed", error);
    setError("root", { type: "manual", message: GENERIC_ERROR_MESSAGE });
  });

  return (
    <div className="flex flex-col bg-white">
      {/* TODO: footer goes below once it exists */}
      <main className="flex justify-center px-4 pt-10 pb-16 md:pt-28 md:pb-24">
        <Card className="h-fit w-full max-w-md">
          <CardHeader>
            {/* CardTitle has no `asChild`/Slot support — nest a real heading
                inside it instead. Tailwind's preflight normalizes h1's
                font-size/weight to `inherit`, so it picks up CardTitle's
                classes below without needing them duplicated here. */}
            <CardTitle className="text-primary text-center text-2xl font-bold md:text-3xl">
              <h1>เข้าสู่ระบบ</h1>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
              <fieldset disabled={isSubmitting} className="contents">
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
                    autoComplete="current-password"
                    placeholder="กรอกรหัสผ่าน"
                    error={!!errors.password}
                    errorMessage={errors.password?.message}
                    {...register("password")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Checkbox
                    label="จำฉันไว้"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  {/* Forgot-password flow is out of scope (see #84) — a real
                      link here would be keyboard-focusable and navigate to
                      "#" for nothing, so keep it a plain label until the
                      route exists. */}
                  {/* <span className="text-foreground-muted text-sm">ลืมรหัสผ่าน</span> */}
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
                  เข้าสู่ระบบ
                </Button>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
