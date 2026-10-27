"use client";

import { useRouter } from "next/navigation";
import { Check, Loader2, Plus } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { toast } from "@/components/ui/Sonner";
import { useSession } from "@/lib/auth-client";
import { api } from "@/trpc/react";

type FollowClubButtonProps = {
  clubId: string;
  clubName: string;
};

export function FollowClubButton({ clubId, clubName }: FollowClubButtonProps) {
  const router = useRouter();
  const { data: session, isPending: isSessionPending } = useSession();
  const isStudent = session?.user.role === "STUDENT";
  const utils = api.useUtils();
  const status = api.clubs.getFollowStatus.useQuery(
    { clubId },
    { enabled: isStudent, retry: false }
  );
  const follow = api.clubs.follow.useMutation();
  const unfollow = api.clubs.unfollow.useMutation();
  const isFollowing = status.data?.isFollowing ?? false;
  const isSaving = follow.isPending || unfollow.isPending;

  const handleClick = async () => {
    if (!session) {
      router.push("/login");
      return;
    }
    if (!isStudent) {
      toast.error("เฉพาะนักศึกษาเท่านั้นที่ติดตามชมรมได้");
      return;
    }
    if (status.isError) {
      toast.error("ไม่สามารถตรวจสอบสถานะการติดตามได้ กรุณาลองอีกครั้ง");
      await status.refetch();
      return;
    }

    try {
      const result = isFollowing
        ? await unfollow.mutateAsync({ clubId })
        : await follow.mutateAsync({ clubId });
      utils.clubs.getFollowStatus.setData({ clubId }, result);
      toast.success(isFollowing ? "เลิกติดตามชมรมแล้ว" : "ติดตามชมรมแล้ว");
    } catch {
      toast.error("ไม่สามารถเปลี่ยนสถานะการติดตามได้ กรุณาลองอีกครั้ง");
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void handleClick()}
      disabled={isSessionPending || (isStudent && status.isPending) || isSaving}
      aria-busy={isSaving}
      aria-pressed={isFollowing}
      aria-label={`${isFollowing ? "เลิกติดตาม" : "ติดตาม"}ชมรม ${clubName}`}
      className="relative h-7 shrink-0 gap-1 rounded-[10px] px-2 text-xs leading-none font-medium md:text-xs md:leading-none"
    >
      <span className={`inline-flex items-center gap-1 ${isSaving ? "invisible" : ""}`}>
        {isFollowing ? "ติดตามแล้ว" : "ติดตาม"}
        {isFollowing ? (
          <Check aria-hidden="true" className="size-3" />
        ) : (
          <Plus aria-hidden="true" className="size-3" />
        )}
      </span>
      {isSaving && (
        <Loader2
          aria-hidden="true"
          className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 animate-spin"
        />
      )}
    </Button>
  );
}
