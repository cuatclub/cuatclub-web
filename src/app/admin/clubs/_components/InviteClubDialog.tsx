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

type SingleResult = { email: string; inviteCode: string };
type BulkResult = RouterOutputs["invitations"]["generateBulk"]["results"][number];

const tabClass =
  "font-ibm-plex flex-1 cursor-pointer rounded-md px-4 py-2 text-sm font-medium transition-colors md:text-base";

export function InviteClubDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("single");
  const [singleResult, setSingleResult] = useState<SingleResult | null>(null);
  const [bulkResults, setBulkResults] = useState<BulkResult[] | null>(null);

  const reset = () => {
    setMode("single");
    setSingleResult(null);
    setBulkResults(null);
  };

  return (
    <DialogRoot
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <UserPlus aria-hidden="true" className="size-4" />
          เชิญชมรม
        </Button>
      </DialogTrigger>
      <DialogContent className="gap-6 overflow-y-auto p-6 md:p-8">
        {singleResult ? (
          <SuccessView
            title="เชิญสำเร็จ"
            description={`รหัสเชิญถูกส่งไปที่อีเมล ${singleResult.email} แล้ว`}
            code={singleResult.inviteCode}
            onInviteAnother={() => setSingleResult(null)}
          />
        ) : bulkResults ? (
          <BulkSuccessView results={bulkResults} onInviteAnother={() => setBulkResults(null)} />
        ) : (
          <>
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

            {mode === "single" ? (
              <SingleInviteForm onSuccess={setSingleResult} />
            ) : (
              <BulkInviteForm onSuccess={setBulkResults} />
            )}
          </>
        )}
      </DialogContent>
    </DialogRoot>
  );
}

type SuccessViewProps = {
  title: string;
  description: string;
  code?: string;
  onInviteAnother: () => void;
};

function SuccessView({ title, description, code, onInviteAnother }: SuccessViewProps) {
  return (
    <div className="animate-in fade-in-0 zoom-in-95 flex flex-col gap-6 duration-200 motion-reduce:animate-none">
      <div className="flex flex-col items-center gap-2 text-center">
        <CheckCircle2 aria-hidden="true" className="text-primary size-10" />
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </div>

      {code && (
        <div className="border-border bg-primary-lighter/30 flex flex-col items-center gap-1 rounded-lg border p-4">
          <p className="font-ibm-plex text-primary text-2xl font-semibold tracking-widest">
            {code}
          </p>
        </div>
      )}

      <Button className="w-full" onClick={onInviteAnother}>
        เชิญอีเมลอื่น
      </Button>
    </div>
  );
}

type BulkSuccessViewProps = {
  results: BulkResult[];
  onInviteAnother: () => void;
};

function BulkSuccessView({ results, onInviteAnother }: BulkSuccessViewProps) {
  const succeeded = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  const allFailed = succeeded.length === 0;

  return (
    <div className="animate-in fade-in-0 zoom-in-95 flex flex-col gap-6 duration-200 motion-reduce:animate-none">
      <div className="flex flex-col items-center gap-2 text-center">
        {allFailed ? (
          <XCircle aria-hidden="true" className="text-error size-10" />
        ) : (
          <CheckCircle2 aria-hidden="true" className="text-primary size-10" />
        )}
        <DialogTitle>{allFailed ? "เชิญไม่สำเร็จ" : "เชิญสำเร็จ"}</DialogTitle>
        <DialogDescription>
          {allFailed
            ? "ไม่สามารถสร้างรหัสเชิญให้อีเมลที่ระบุได้เลย"
            : "ส่งรหัสเชิญให้แต่ละอีเมลทางอีเมลแล้ว"}
        </DialogDescription>
      </div>

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
                    <li key={r.email} className="text-foreground-muted text-xs md:text-sm">
                      {r.email}
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

      <Button className="w-full" onClick={onInviteAnother}>
        เชิญเพิ่มเติม
      </Button>
    </div>
  );
}

function SingleInviteForm({ onSuccess }: { onSuccess: (result: SingleResult) => void }) {
  const mutation = api.invitations.generate.useMutation();
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
      onSuccess({ email: output.email, inviteCode: output.inviteCode });
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
    </form>
  );
}

function BulkInviteForm({ onSuccess }: { onSuccess: (results: BulkResult[]) => void }) {
  const mutation = api.invitations.generateBulk.useMutation();
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
      onSuccess(output.results);
      reset();
    } catch (cause) {
      console.error("[admin/clubs] bulk generate invitation code failed", cause);
      setRootError(GENERIC_ERROR_MESSAGE);
    }
  });

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
    </form>
  );
}
