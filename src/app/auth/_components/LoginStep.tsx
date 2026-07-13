import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { defaultHomePathForRole, pendingOnboardingPath } from "@/lib/auth-paths";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

interface LoginStepProps {
    type: "attendee" | "organizer";
    onBack: () => void;
    onNext: () => void;
}

type LoginFormValues = {
    email: string;
    password: string;
    confirmPassword: string;
};

export default function LoginStep({ type, onBack, onNext }: LoginStepProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [submitError, setSubmitError] = useState("");
    const router = useRouter();

    // Where to land after signing in, when the user was sent here mid-task — following a club from
    // /clubs, say. Read from the URL rather than useSearchParams: this component renders on pages
    // with no Suspense boundary, and the value is only needed on submit, long after mount.
    const [redirectTo, setRedirectTo] = useState<string | null>(null);
    useEffect(() => {
        const target = new URLSearchParams(window.location.search).get("redirect");
        // Same-origin paths only. `//evil.com` is protocol-relative, not an internal route.
        if (target?.startsWith("/") && !target.startsWith("//")) setRedirectTo(target);
    }, []);

    const imageSrc =
        type === "attendee"
            ? "/images/svg/attendee_auth.svg"
            : "/images/svg/organizer_auth.svg";


    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        defaultValues: { email: "", password: "", confirmPassword: "" },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setSubmitError("");
        try {
            if (isLogin || type === "organizer") {
                const { error } = await authClient.signIn.email({
                    email: data.email,
                    password: data.password,
                });
                if (error) throw new Error(error.message ?? "เกิดข้อผิดพลาด");
                const { data: sessionData } = await authClient.getSession();
                const user = sessionData?.user;
                const pending = pendingOnboardingPath(user ?? null);
                // Onboarding still wins over any return path.
                router.push(
                    pending ?? redirectTo ?? defaultHomePathForRole(user?.role),
                );
            } else {
                const { error } = await authClient.signUp.email({
                    email: data.email,
                    password: data.password,
                    name: "username",
                    role: type === "attendee" ? "ATTENDEE" : "ORGANIZATION",
                    callbackURL: "/auth/attendee/onboarding",
                    onboardingComplete: false,
                });
                if (error) throw new Error(error.message ?? "เกิดข้อผิดพลาด");
                onNext();
            }
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
            setSubmitError(message);
        }
    };

    const googleLogin = async () => {
        setSubmitError("");
        try {
            const { error } = await authClient.signIn.social({
                provider: "google",
                callbackURL: redirectTo ?? "/",
            });
            if (error) throw new Error(error.message ?? "เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
        } catch (e: unknown) {
            const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
            setSubmitError(message);
        }
    };

    return (
        <div className="flex flex-col h-full justify-between">
            {/* Header */}
            <div className="flex justify-between items-center">
                <ArrowLeft
                    onClick={onBack}
                    className="cursor-pointer text-text-gray hover:text-text-gray-hover"
                />
                <ArrowLeft className="text-white" />
            </div>

            {/* Content */}
            <div className="flex flex-col items-center gap-4 w-full">
                <Image
                    src={imageSrc}
                    alt={type}
                    width={170}
                    height={170}
                    className="w-[100px] sm:w-[140px] h-auto"
                />
                <h1 className="w-full text-xl sm:text-[26px] font-semibold text-center">
                    {type === "attendee"
                        ? isLogin
                            ? "เข้าสู่ระบบผู้เข้าร่วม"
                            : "ลงทะเบียนผู้เข้าร่วม"
                        : "เข้าสู่ระบบผู้จัดกิจกรรม"}
                </h1>
                <form
                    id="login-form"
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col gap-2.5 w-full"
                >
                    <div className="w-full flex flex-col gap-1">
                        <Input
                            placeholder="อีเมล"
                            type="email"
                            className="w-full focus:border-primary"
                            aria-invalid={!!errors.email}
                            {...register("email", {
                                required: "กรุณากรอกอีเมล",
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: "รูปแบบอีเมลไม่ถูกต้อง",
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="w-full flex flex-col gap-1">
                        <Input
                            type="password"
                            placeholder="รหัสผ่าน"
                            className="w-full focus:border-primary"
                            aria-invalid={!!errors.password}
                            {...register("password", {
                                required: "กรุณากรอกรหัสผ่าน",
                                minLength: {
                                    value: 6,
                                    message: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
                                },
                            })}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-xs">{errors.password.message}</p>
                        )}
                    </div>
                    {!isLogin && (
                        <div className="w-full flex flex-col gap-1">
                            <Input
                                type="password"
                                placeholder="ยืนยันรหัสผ่าน"
                                className="w-full focus:border-primary"
                                aria-invalid={!!errors.confirmPassword}
                                {...register("confirmPassword", {
                                    required: "กรุณายืนยันรหัสผ่าน",
                                    validate: (value) =>
                                        value === getValues("password") || "รหัสผ่านไม่ตรงกัน",
                                })}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    )}
                    {submitError && (
                        <p className="text-red-500 text-xs w-full">{submitError}</p>
                    )}
                </form>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
                <Button
                    type="submit"
                    form="login-form"
                    className="h-9 sm:h-10.5 text-sm sm:text-base"
                    disabled={isSubmitting}
                >
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLogin || type === "organizer" ? "เข้าสู่ระบบ" : "ลงทะเบียน"}
                </Button>

                {type === "attendee" && (
                    <Button
                        type="button"
                        variant="outline"
                        className="border-stroke h-9 sm:h-10.5 text-sm sm:text-base w-full flex items-center justify-center gap-2 bg-white hover:bg-white text-black/54 hover:text-black/54"
                        disabled={isSubmitting}
                        onClick={googleLogin}
                    >
                        <Image
                            src="/images/svg/google_logo.svg"
                            alt="Google"
                            width={20}
                            height={20}
                        />
                        เข้าสู่ระบบด้วย Google
                    </Button>
                )}

                {type === "organizer" && (
                    <p className="text-center text-xs sm:text-sm text-text-gray mt-1">
                        หากต้องการสร้างแอคเค้าให้ติดต่อแอดมินผ่านไอจี{" "}
                        <span className="font-semibold text-primary">@cuatclub</span>
                    </p>
                )}
            </div>

            {/* Footer links */}
            <div className="flex justify-between">
                <div className="flex flex-col gap-0.5">
                    {type === "attendee" && isLogin && (
                        <Link href="">
                            <span className="text-xs sm:text-sm text-text-gray underline">ลืมรหัสผ่าน</span>
                        </Link>
                    )}
                    {type === "attendee" && (
                        <button onClick={() => setIsLogin(!isLogin)}>
                            <span className="text-xs sm:text-sm text-text-gray underline">
                                {isLogin ? "ยังไม่มีบัญชี? ลงทะเบียน" : "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ"}
                            </span>
                        </button>
                    )}
                    {type === "organizer" && (
                        <Link href="">
                            <span className="text-xs sm:text-sm text-text-gray underline">ลืมรหัสผ่าน</span>
                        </Link>
                    )}
                </div>

                <Link href={type === "attendee" ? "/auth/organizer/login" : "/auth/attendee/login"}>
                    <span className="text-xs sm:text-sm text-text-gray underline text-right">
                        {type === "attendee" ? "ลงชื่อในฐานะผู้จัดกิจกรรม" : "ลงชื่อในฐานะผู้เข้าร่วมกิจกรรม"}
                    </span>
                </Link>
            </div>
        </div>
    );
}
