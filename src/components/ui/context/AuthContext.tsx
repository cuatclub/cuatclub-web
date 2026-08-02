"use client";

import { createContext, useContext } from "react";
import { useSession } from "@/lib/auth-client";
import { redirect, usePathname } from "next/navigation";

type AuthContextValue = {
  isLoggedIn: boolean;
  isOrg: boolean;
  user: { name: string | null; image: string | null } | null;
};

const AuthContext = createContext<AuthContextValue>({
  isLoggedIn: false,
  isOrg: false,
  user: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const user = session?.user ?? null;
  const isLoggedIn = !!user;
  const isOrg = user?.role === "ORGANIZATION";
  
  const value: AuthContextValue = {
    isLoggedIn,
    isOrg,
    user: user
    ? { name: user.name ?? null, image: user.image ?? null }
    : null,
  };

  /* FOR FIRST OFFICIAL LAUNCH */
  const pathname = usePathname()
  const protected_paths = ["/auth", "/feed", "/calendar"]
  const isProtected = protected_paths.some((p) => (pathname !== "/" && pathname.startsWith(p)) || pathname === p)
  
  if (isProtected) {
    redirect("/clubs")
  }
  /* FOR FIRST OFFICIAL LAUNCH */
  
  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);