import Link from "next/link";
import { ArrowLeft, KeyRound, type LucideIcon } from "lucide-react";

import { Card, CardContent, CardTitle } from "@/components/ui";

interface PasswordCardProps {
  icon?: LucideIcon;
  title: string;
  description: React.ReactNode;
  children?: React.ReactNode;
}

/** Shared shell for the forgot-password and reset-password screens. */
export function PasswordCard({
  icon: Icon = KeyRound,
  title,
  description,
  children,
}: PasswordCardProps) {
  return (
    <div className="flex flex-col bg-white">
      <main className="flex justify-center px-4 pt-10 pb-16 md:pt-28 md:pb-24">
        <Card className="h-fit w-full max-w-md">
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="bg-primary-lighter/40 flex size-16 items-center justify-center rounded-full">
                <div className="bg-primary-lighter flex size-11 items-center justify-center rounded-full">
                  <Icon aria-hidden="true" className="text-primary size-6" strokeWidth={2.5} />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <CardTitle className="text-primary text-2xl leading-normal font-bold md:text-3xl">
                  <h1>{title}</h1>
                </CardTitle>
                <p className="text-foreground-muted text-sm leading-6">{description}</p>
              </div>
            </div>

            {children}

            <Link
              href="/login"
              className="text-primary flex items-center justify-center gap-1.5 text-sm font-medium"
            >
              <ArrowLeft aria-hidden="true" className="size-4" />
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
