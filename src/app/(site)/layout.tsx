import { headers } from "next/headers";

import { auth } from "@/server/auth";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components";

export default async function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar
        isLoggedIn={!!session}
        userName={session?.user.name}
        userEmail={session?.user.email}
        userRole={session?.user.role}
        userImage={session?.user.image}
      />
      <div className="flex flex-1 flex-col">{children}</div>
      <Footer />
    </div>
  );
}
