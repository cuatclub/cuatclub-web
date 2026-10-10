import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";

import {
  ActivityActions,
  ActivityOverview,
  BackLink,
  RelatedActivities,
  getApplicationStatus,
} from "@/app/(site)/activities/[activityId]/_components";
import { ClubContacts } from "@/app/(site)/clubs/[clubId]/_components";
import { api } from "@/trpc/server";

type ActivityDetailPageProps = {
  params: Promise<{ activityId: string }>;
};

/**
 * A malformed id fails input validation (BAD_REQUEST); an unknown one, or one whose club isn't
 * public, is NOT_FOUND. Either way there's no activity at this URL, so both show the 404 page
 * rather than the error boundary.
 */
const getActivity = async (activityId: string) => {
  try {
    return await api.activities.getById({ activityId });
  } catch (error) {
    if (
      error instanceof TRPCError &&
      (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")
    ) {
      notFound();
    }
    throw error;
  }
};

export default async function ActivityDetailPage({ params }: ActivityDetailPageProps) {
  const { activityId } = await params;
  const activity = await getActivity(activityId);

  const now = new Date();
  const status = getApplicationStatus(activity, now);
  const remainingMs = activity.applicationEndAt.getTime() - now.getTime();

  return (
    <>
      <main className="mx-auto flex w-full max-w-[1512px] flex-col gap-9 px-5 pt-5 pb-5 md:gap-12 md:px-8 md:pt-10 md:pb-20 xl:px-25">
        <BackLink />

        <div className="flex flex-col gap-9 md:gap-16">
          <ActivityOverview activity={activity} status={status} remainingMs={remainingMs} />

          <div className="flex flex-col gap-5 md:gap-12">
            {activity.club.contacts && (
              <ClubContacts contacts={activity.club.contacts} clubName={activity.club.name} />
            )}

            {activity.relatedActivities.length > 0 && (
              <div className="flex flex-col gap-6 md:gap-9">
                <hr className="border-border" />
                <RelatedActivities activities={activity.relatedActivities} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sticks to the bottom of the screen while scrolling, then settles above the footer. */}
      <div className="sticky bottom-0 z-10 bg-white p-4 shadow-black md:hidden">
        <ActivityActions
          title={activity.title}
          applicationFormUrl={activity.applicationFormUrl}
          isApplicationOpen={status === "open"}
        />
      </div>
    </>
  );
}
