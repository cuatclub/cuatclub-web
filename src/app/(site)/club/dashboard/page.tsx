import { redirect } from "next/navigation";

// No content of its own — "My Posts" is the dashboard's default tab, so the bare /club/dashboard
// index just forwards there instead of 404ing. Runs under this segment's own layout.tsx, so
// clubDashboardGuard still applies before the redirect fires.
export default function DashboardIndexPage() {
  redirect("/club/dashboard/posts");
}
