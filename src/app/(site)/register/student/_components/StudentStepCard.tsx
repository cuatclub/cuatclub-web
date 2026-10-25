import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { BackLink } from "@/app/(site)/register/student/_components/BackLink";
import { StepDots } from "@/app/(site)/register/student/_components/StepDots";

interface StudentStepCardProps {
  title: string;
  step: number;
  backHref?: string;
  children: ReactNode;
}

/** Shared frame for student registration steps 2-4: back link, title, form, progress dots. */
export function StudentStepCard({ title, step, backHref, children }: StudentStepCardProps) {
  return (
    <div className="flex flex-col bg-white">
      <main className="flex justify-center px-4 pt-5 pb-8 md:pt-20 md:pb-16">
        <Card className="h-fit w-full max-w-md">
          <CardHeader className="gap-4">
            {backHref && <BackLink href={backHref} />}
            <CardTitle className="text-primary text-2xl font-bold md:text-3xl">
              <h1>{title}</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {children}
            <StepDots step={step} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
