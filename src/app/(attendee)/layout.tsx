import { requireRole } from "@/lib/require-role";

export default async function AttendeeGroupLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// await requireRole("ATTENDEE");
	return children;
}
