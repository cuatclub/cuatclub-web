import { headers } from "next/headers";

import { auth } from "@/server/auth";
import { Navbar } from "@/components/Navbar";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <>
      <Navbar
        isLoggedIn={!!session}
        userName={session?.user.name}
        userEmail={session?.user.email}
      />
      {children}
    </>
  );
}
