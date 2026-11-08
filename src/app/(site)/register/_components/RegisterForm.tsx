"use client";

import { useState } from "react";
import { User, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components";
import { ToggleGroup, ToggleGroupItem } from "@/app/(site)/register/_components/ToggleGroup";
import { ClubRegisterForm } from "@/app/(site)/register/_components/ClubRegisterForm";
import { StudentRegisterForm } from "@/app/(site)/register/_components/StudentRegisterForm";

type AccountType = "student" | "club";

export function RegisterForm() {
  const [accountType, setAccountType] = useState<AccountType>("student");

  return (
    <div className="flex flex-col bg-white">
      <main className="flex justify-center px-4 pt-5 pb-8 md:pt-20 md:pb-16">
        <Card className="h-fit w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-primary text-2xl font-bold md:text-3xl">
              <h1>ลงทะเบียน</h1>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <p
                id="account-type-label"
                className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
              >
                คุณต้องการลงทะเบียนเป็น
              </p>
              <ToggleGroup
                type="single"
                value={accountType}
                onValueChange={(value) => value && setAccountType(value as AccountType)}
                aria-labelledby="account-type-label"
                className="w-full"
              >
                <ToggleGroupItem value="student" className="flex-1">
                  <User aria-hidden="true" />
                  นักศึกษา
                </ToggleGroupItem>
                <ToggleGroupItem value="club" className="flex-1">
                  <Users aria-hidden="true" />
                  ชมรม
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {accountType === "student" ? <StudentRegisterForm /> : <ClubRegisterForm />}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
