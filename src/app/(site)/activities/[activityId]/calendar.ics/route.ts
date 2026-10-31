import { TRPCError } from "@trpc/server";

import { buildApplicationDeadlineEvent } from "@/features/activities/calendar/application-deadline-event";
import { buildApplicationDeadlineIcs } from "@/features/activities/calendar/ics";
import { api } from "@/trpc/server";

type CalendarRouteContext = {
  params: Promise<{ activityId: string }>;
};

/**
 * The application deadline of an activity as an `.ics` file, for calendars that can't be opened
 * from a link (Apple Calendar and the rest). Loads the activity as its page does, so an id the
 * page would 404 on has no file either.
 */
export async function GET(request: Request, { params }: CalendarRouteContext) {
  const { activityId } = await params;

  try {
    const activity = await api.activities.getById({ activityId });
    const event = buildApplicationDeadlineEvent(activity, new URL(request.url).origin);

    return new Response(buildApplicationDeadlineIcs(event, new Date()), {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="deadline-${activity.id}.ics"`,
      },
    });
  } catch (error) {
    if (
      error instanceof TRPCError &&
      (error.code === "NOT_FOUND" || error.code === "BAD_REQUEST")
    ) {
      return new Response("Not found", { status: 404 });
    }
    throw error;
  }
}
