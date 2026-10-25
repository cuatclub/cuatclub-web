"use client";

import { useRouter } from "next/navigation";

import { toast } from "@/components/ui";
import { useIsSignedIn } from "@/features/auth/ViewerProvider";
import { api, type RouterOutputs } from "@/trpc/react";

const LOGIN_PATH = "/login";

/** One `Set` per fetch, shared by every card — the select function's identity keeps it memoized. */
const toIdSet = (data: { activityIds: string[] }) => new Set(data.activityIds);

/**
 * Whether the signed-in visitor has saved an activity, and a way to flip it. Every card on a page
 * reads the same single `getSavedIds` query rather than asking per card.
 *
 * Flips optimistically: the id list is patched at once and put back, with a toast, if the server
 * refuses. A signed-out visitor is sent to sign in instead; so is one the server turns away with
 * UNAUTHORIZED (an expired session), after a quiet rollback. Whether the visitor is signed in comes
 * from the server-rendered layout, not a lookup in the browser.
 */
export function useSavedActivity(activityId: string) {
  const router = useRouter();
  const utils = api.useUtils();
  const isSignedIn = useIsSignedIn();

  const { data: savedIds } = api.activities.getSavedIds.useQuery(
    {},
    { enabled: isSignedIn, select: toIdSet }
  );
  const isSaved = savedIds?.has(activityId) ?? false;

  const applyOptimistically = async (saved: boolean) => {
    await utils.activities.getSavedIds.cancel();
    const previous = utils.activities.getSavedIds.getData({});

    utils.activities.getSavedIds.setData({}, (current) => {
      if (!current) return current;
      const others = current.activityIds.filter((id) => id !== activityId);
      return { activityIds: saved ? [...others, activityId] : others };
    });

    return { previous };
  };

  const rollback = (previous: RouterOutputs["activities"]["getSavedIds"] | undefined) => {
    utils.activities.getSavedIds.setData({}, previous);
  };

  const refresh = () =>
    Promise.all([
      utils.activities.getSavedIds.invalidate(),
      utils.activities.getSaved.invalidate(),
    ]);

  /** Rolls back, then either sends a visitor the server turned away to sign in or toasts. */
  const handleError = (
    error: { data?: { code?: string } | null },
    previous: RouterOutputs["activities"]["getSavedIds"] | undefined,
    message: string
  ) => {
    rollback(previous);
    if (error.data?.code === "UNAUTHORIZED") router.push(LOGIN_PATH);
    else toast.error(message);
  };

  const save = api.activities.save.useMutation({
    onMutate: () => applyOptimistically(true),
    onError: (error, _input, context) =>
      handleError(error, context?.previous, "บันทึกกิจกรรมไม่สำเร็จ กรุณาลองอีกครั้ง"),
    onSettled: refresh,
  });

  const unsave = api.activities.unsave.useMutation({
    onMutate: () => applyOptimistically(false),
    onError: (error, _input, context) =>
      handleError(error, context?.previous, "ยกเลิกการบันทึกไม่สำเร็จ กรุณาลองอีกครั้ง"),
    onSettled: refresh,
  });

  const toggle = () => {
    if (!isSignedIn) {
      router.push(LOGIN_PATH);
      return;
    }
    if (save.isPending || unsave.isPending) return;

    if (isSaved) unsave.mutate({ activityId });
    else save.mutate({ activityId });
  };

  return { isSaved, toggle };
}
