"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, UserPlus, XCircle } from "lucide-react";

import { api, type RouterOutputs } from "@/trpc/react";
import {
  Button,
  DialogContent,
  DialogDescription,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  Input,
  Textarea,
} from "@/components";
import { cn } from "@/lib/utils";
import {
  BULK_EMAILS_MAX,
  BULK_EMAILS_MAX_MESSAGE,
  GENERIC_ERROR_MESSAGE,
  inviteBulkSchema,
  inviteSingleSchema,
  parseBulkInvitations,
  type InviteBulkFormValues,
  type InviteSingleFormValues,
} from "@/app/admin/clubs/_components/invite-club-schema";

type Mode = "single" | "bulk";

const tabClass =
  "font-ibm-plex flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors md:text-base";

export function InviteClubDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("single");

  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setMode("single");
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus aria-hidden="true" className="size-4" />
          เชิญชมรม
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-6 overflow-y-auto p-6 md:p-8">
        <div className="flex flex-col gap-1">
          <DialogTitle>เชิญชมรมเข้าร่วม</DialogTitle>
          <DialogDescription>สร้างรหัสเชิญเพื่อส่งให้ชมรมใช้ลงทะเบียน</DialogDescription>
        </div>

        <div className="border-border bg-border/40 flex w-full gap-1 rounded-lg border p-1">
          <button
            type="button"
            onClick={() => setMode("single")}
            className={cn(
              tabClass,
              mode === "single"
                ? "bg-primary text-white"
                : "text-foreground-muted hover:text-primary hover:bg-primary-lighter"
            )}
          >
            ทีละอีเมล
          </button>
          <button
            type="button"
            onClick={() => setMode("bulk")}
            className={cn(
              tabClass,
              mode === "bulk"
                ? "bg-primary text-white"
                : "text-foreground-muted hover:text-primary hover:bg-primary-lighter"
            )}
          >
            เชิญหลายรายการ
          </button>
        </div>

        {mode === "single" ? <SingleInviteForm /> : <BulkInviteForm />}
      </DialogContent>
    </DialogRoot>
  );
}

function SingleInviteForm() {
  const mutation = api.invitations.generate.useMutation();
  const [result, setResult] = useState<{ email: string; inviteCode: string } | null>(null);
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InviteSingleFormValues>({ resolver: zodResolver(inviteSingleSchema) });

  const onSubmit = handleSubmit(async ({ email }) => {
    setRootError(null);
    try {
      const output = await mutation.mutateAsync({ email });
      setResult({ email: output.email, inviteCode: output.inviteCode });
      reset();
    } catch (cause) {
      console.error("[admin/clubs] generate invitation code failed", cause);
      setRootError(GENERIC_ERROR_MESSAGE);
    }
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
        <Input
          label="อีเมล"
          type="email"
          autoComplete="off"
          placeholder="club@example.com"
          error={!!errors.email}
          errorMessage={errors.email?.message}
          {...register("email")}
        />

        {rootError && (
          <p role="alert" className="text-error text-sm">
            {rootError}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          สร้างรหัสเชิญ
        </Button>
      </fieldset>

      {result && (
        <div className="border-border bg-primary-lighter/30 flex flex-col gap-1 rounded-lg border p-4">
          <p className="text-foreground-muted text-sm">
            สร้างรหัสเชิญสำหรับ {result.email} แล้ว กรุณาส่งรหัสนี้ให้ชมรม
          </p>
          <p className="font-ibm-plex text-primary text-lg font-semibold tracking-widest">
            {result.inviteCode}
          </p>
        </div>
      )}
    </form>
  );
}

type BulkResult = RouterOutputs["invitations"]["generateBulk"]["results"][number];

function BulkInviteForm() {
  const mutation = api.invitations.generateBulk.useMutation();
  const [results, setResults] = useState<BulkResult[] | null>(null);
  const [rootError, setRootError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InviteBulkFormValues>({ resolver: zodResolver(inviteBulkSchema) });

  const onSubmit = handleSubmit(async ({ emailsText }) => {
    setRootError(null);
    setResults(null);

    const { invitations, errors: parseErrors } = parseBulkInvitations(emailsText);

    if (parseErrors.length > 0) {
      setError("emailsText", { type: "manual", message: parseErrors.join(" · ") });
      return;
    }

    if (invitations.length > BULK_EMAILS_MAX) {
      setError("emailsText", { type: "manual", message: BULK_EMAILS_MAX_MESSAGE });
      return;
    }

    try {
      const output = await mutation.mutateAsync({ invitations });
      setResults(output.results);
      reset();
    } catch (cause) {
      console.error("[admin/clubs] bulk generate invitation code failed", cause);
      setRootError(GENERIC_ERROR_MESSAGE);
    }
  });

  const succeeded = results?.filter((r) => r.success) ?? [];
  const failed = results?.filter((r) => !r.success) ?? [];

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit} noValidate>
      <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
        <Textarea
          label="อีเมล (บรรทัดละ 1 รายการ)"
          placeholder={"club1@example.com\nclub2@example.com"}
          error={!!errors.emailsText}
          errorMessage={errors.emailsText?.message}
          rows={6}
          {...register("emailsText")}
        />
        <p className="font-ibm-plex text-foreground-muted text-xs">
          หนึ่งอีเมลต่อหนึ่งบรรทัด — สูงสุด {BULK_EMAILS_MAX} รายการต่อครั้ง
        </p>

        {rootError && (
          <p role="alert" className="text-error text-sm">
            {rootError}
          </p>
        )}

        <Button type="submit" className="w-full" isLoading={isSubmitting}>
          สร้างรหัสเชิญทั้งหมด
        </Button>
      </fieldset>

      {results && (
        <div className="flex flex-col gap-3">
          {succeeded.length > 0 && (
            <div className="border-border bg-primary-lighter/30 flex flex-col gap-2 rounded-lg border p-4">
              <p className="text-foreground flex items-center gap-1.5 text-sm font-medium">
                <CheckCircle2 aria-hidden="true" className="text-primary size-4 shrink-0" />
                สำเร็จ {succeeded.length} รายการ
              </p>
              <ul className="flex flex-col gap-1">
                {succeeded.map(
                  (r) =>
                    r.success && (
                      <li
                        key={r.email}
                        className="text-foreground-muted flex flex-wrap items-center justify-between gap-2 text-xs md:text-sm"
                      >
                        <span>{r.email}</span>
                        <span className="font-ibm-plex text-primary font-semibold tracking-widest">
                          {r.inviteCode}
                        </span>
                      </li>
                    )
                )}
              </ul>
            </div>
          )}

          {failed.length > 0 && (
            <div className="border-error/30 flex flex-col gap-2 rounded-lg border bg-red-50 p-4">
              <p className="text-error flex items-center gap-1.5 text-sm font-medium">
                <XCircle aria-hidden="true" className="size-4 shrink-0" />
                ไม่สำเร็จ {failed.length} รายการ
              </p>
              <ul className="flex flex-col gap-1">
                {failed.map(
                  (r) =>
                    !r.success && (
                      <li key={r.email} className="text-foreground-muted text-xs md:text-sm">
                        {r.email}: {r.message}
                      </li>
                    )
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
