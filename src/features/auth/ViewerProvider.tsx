"use client";

import { createContext, useContext } from "react";

const ViewerContext = createContext(false);

type ViewerProviderProps = {
  isSignedIn: boolean;
  children: React.ReactNode;
};

/**
 * Hands the server's reading of the session to client components, so they never have to look it up
 * again in the browser. Mount it where the session is already read (the site layout).
 */
export function ViewerProvider({ isSignedIn, children }: ViewerProviderProps) {
  return <ViewerContext.Provider value={isSignedIn}>{children}</ViewerContext.Provider>;
}

/** Whether the visitor is signed in. `false` outside a `ViewerProvider`. */
export function useIsSignedIn(): boolean {
  return useContext(ViewerContext);
}
