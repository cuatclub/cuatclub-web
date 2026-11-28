import { type Metadata } from "next";

import { ResetPasswordForm } from "./_components/ResetPasswordForm";

// The token is in this page's URL, so keep it out of outgoing Referer headers.
export const metadata: Metadata = { referrer: "no-referrer" };

export default async function ResetPassword({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  return <ResetPasswordForm token={error ? undefined : token} />;
}
