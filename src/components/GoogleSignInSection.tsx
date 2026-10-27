"use client";

import { useState } from "react";

import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui";
import { GoogleIcon } from "@/components/icons";

interface GoogleSignInSectionProps {
  /** Where better-auth sends the user once Google has authenticated them. */
  callbackURL: string;
  /** Called only when the redirect to Google could not be started. */
  onError: () => void;
}

/**
 * "หรือ" divider plus the "continue with Google" button, shared by the login and register forms.
 *
 * signIn.social redirects the whole page to Google, so there is nothing to do on success; only a
 * failure to start the redirect needs surfacing. signIn.social resolves with `{ error }` for
 * HTTP-level failures but rejects for a network-level one, hence both branches.
 */
export function GoogleSignInSection({ callbackURL, onError }: GoogleSignInSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    let failure: unknown = null;
    try {
      ({ error: failure } = await signIn.social({ provider: "google", callbackURL }));
    } catch (cause) {
      failure = cause;
    }

    if (failure) {
      console.error("[auth] google sign-in failed", failure);
      setIsLoading(false);
      onError();
    }
  };

  return (
    <>
      <div className="flex items-center gap-4" role="separator" aria-label="หรือ">
        <span className="bg-border h-px flex-1" />
        <span className="text-placeholder text-sm">หรือ</span>
        <span className="bg-border h-px flex-1" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="border-border text-foreground-secondary hover:bg-border/30 w-full"
        isLoading={isLoading}
        onClick={handleClick}
      >
        <GoogleIcon className="size-5" />
        ดำเนินการต่อด้วย Google
      </Button>
    </>
  );
}
