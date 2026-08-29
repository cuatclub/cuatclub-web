import type { ReactNode } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { Tag } from "@/components/ui/Tag";
import type { ClubDetailOutputDTO } from "@/server/api/modules/clubs/dto";

type ClubRegistrationReviewProps = {
  club: ClubDetailOutputDTO;
  actions: ReactNode;
};

const displayValue = (value: string | null | undefined) => (value?.trim() ? value : "—");

export function ClubRegistrationReview({ club, actions }: ClubRegistrationReviewProps) {
  const contacts = [
    { label: "Instagram", value: club.contacts?.instagram },
    { label: "Facebook", value: club.contacts?.facebook },
    { label: "TikTok", value: club.contacts?.tiktok },
    { label: "Line OA", value: club.contacts?.line_oa },
  ];
  const hasContacts = contacts.some(({ value }) => Boolean(value?.trim()));

  return (
    <Card className="w-full max-w-[874px] gap-0 py-0">
      <div className="flex flex-col gap-8 px-8 py-8 md:gap-6">
        <h2 className="font-ibm-plex text-primary text-lg leading-[30px] font-bold md:text-2xl md:leading-[33px]">
          ตรวจสอบข้อมูล
        </h2>

        <section className="flex flex-col gap-5 md:grid md:grid-cols-[160px_minmax(0,1fr)] md:gap-10">
          {club.logoUrl ? (
            <Image
              src={club.logoUrl}
              alt={`โลโก้${club.name}`}
              width={128}
              height={128}
              className="size-40 rounded-lg object-cover"
            />
          ) : (
            <div
              aria-label="ไม่มีโลโก้ชมรม"
              className="bg-surface flex size-40 items-center justify-center rounded-lg"
            >
              <ImageIcon aria-hidden="true" className="text-placeholder size-10" />
            </div>
          )}

          <dl className="grid min-w-0 grid-rows-3 gap-3 md:h-40 md:gap-0 md:self-stretch">
            <div className="grid min-w-0 grid-cols-[125px_minmax(0,1fr)] items-center gap-3 md:grid-cols-[112px_minmax(0,1fr)] md:gap-4">
              <dt className="font-ibm-plex text-foreground text-sm leading-[23px] font-semibold md:text-base md:leading-[26px]">
                ชื่อชมรม
              </dt>
              <dd className="font-ibm-plex text-foreground-secondary min-w-0 text-sm leading-[23px] md:text-base md:leading-[26px]">
                {club.name}
              </dd>
            </div>
            <div className="grid min-w-0 grid-cols-[125px_minmax(0,1fr)] items-center gap-3 md:grid-cols-[112px_minmax(0,1fr)] md:gap-4">
              <dt className="font-ibm-plex text-foreground text-sm leading-[23px] font-semibold md:text-base md:leading-[26px]">
                คณะ/สังกัด
              </dt>
              <dd className="font-ibm-plex text-foreground-secondary min-w-0 text-sm leading-[23px] md:text-base md:leading-[26px]">
                {club.affiliation?.label ?? "—"}
              </dd>
            </div>
            <div className="grid min-w-0 grid-cols-[125px_minmax(0,1fr)] items-center gap-3 md:grid-cols-[112px_minmax(0,1fr)] md:gap-4">
              <dt className="font-ibm-plex text-foreground text-sm leading-[23px] font-semibold md:text-base md:leading-[26px]">
                หมวดหมู่
              </dt>
              <dd className="min-w-0">
                {club.categories.length > 0 ? (
                  <ul className="flex flex-wrap gap-2">
                    {club.categories.map((category) => (
                      <li key={category.id}>
                        <Tag color={category.fontColor} bgColor={category.backgroundColor}>
                          {category.label}
                        </Tag>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="font-ibm-plex text-foreground text-sm leading-[23px] md:text-base md:leading-[26px]">
                    —
                  </span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h3 className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold">
              คำอธิบายแบบย่อ
            </h3>
            <p className="font-ibm-plex text-foreground-secondary text-sm leading-[23px] wrap-break-word whitespace-pre-line md:text-base md:leading-[26px]">
              {displayValue(club.shortDescription)}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold">
              คำอธิบายแบบละเอียด
            </h3>
            <p className="font-ibm-plex text-foreground-secondary text-sm leading-[23px] wrap-break-word whitespace-pre-line md:text-base md:leading-[26px]">
              {displayValue(club.longDescription)}
            </p>
          </div>
        </section>

        {club.imageUrls.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold">
              รูปบรรยากาศชมรม
            </h3>
            <ul className="grid min-w-0 grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-3 md:grid-cols-5">
              {club.imageUrls.map((imageUrl, index) => (
                <li key={imageUrl} className="min-w-0 overflow-hidden rounded-lg">
                  <Image
                    src={imageUrl}
                    alt={`รูปบรรยากาศชมรม ${club.name} รูปที่ ${index + 1}`}
                    width={160}
                    height={160}
                    sizes="(min-width: 768px) 15vw, 160px"
                    className="aspect-square w-full rounded-lg object-cover"
                  />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h3 className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold">
            ช่องทางติดต่อ
          </h3>
          {hasContacts ? (
            <dl className="grid grid-cols-1 gap-x-10 gap-y-3 md:grid-flow-col md:grid-cols-2 md:grid-rows-2">
              {contacts.map(({ label, value }) => (
                <div key={label} className="flex min-w-0 gap-4">
                  <dt className="font-ibm-plex text-foreground w-20 shrink-0 text-sm leading-[23px] font-medium md:text-base md:leading-[26px]">
                    {label}
                  </dt>
                  <dd className="font-ibm-plex text-foreground-secondary min-w-0 text-sm leading-[23px] wrap-break-word md:text-base md:leading-[26px]">
                    {displayValue(value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px] md:text-base md:leading-[26px]">
              ไม่มีข้อมูลช่องทางติดต่อ
            </p>
          )}
        </section>
      </div>

      <div className="px-5 py-6 md:px-10 md:py-8">{actions}</div>
    </Card>
  );
}
