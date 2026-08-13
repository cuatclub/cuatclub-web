import Image from "next/image";
import { Building2 } from "lucide-react";

import { Tag } from "@/components/ui/Tag";
import type { RouterOutputs } from "@/trpc/react";

type Club = RouterOutputs["clubs"]["getById"];

type ClubHeaderProps = {
  name: Club["name"];
  logoUrl: Club["logoUrl"];
  affiliation: Club["affiliation"];
  categories: Club["categories"];
};

export function ClubHeader({ name, logoUrl, affiliation, categories }: ClubHeaderProps) {
  return (
    <header className="flex items-start gap-4">
      {logoUrl ? (
        <Image
          src={logoUrl}
          alt={`โลโก้${name}`}
          width={128}
          height={128}
          priority
          className="size-24 shrink-0 rounded-full object-cover md:size-32"
        />
      ) : (
        // No logo uploaded — stand in with the club's initial rather than a broken frame.
        <div
          aria-hidden="true"
          className="bg-primary-lighter text-primary font-ibm-plex flex size-24 shrink-0 items-center justify-center rounded-full text-3xl font-bold md:size-32 md:text-5xl"
        >
          {name.charAt(0)}
        </div>
      )}

      {/* Matches the logo's height so the three rows spread across it, but grows if the
          name wraps onto a second line. */}
      <div className="flex min-h-24 flex-col justify-between gap-2 md:min-h-32">
        <h1 className="font-ibm-plex text-foreground text-xl leading-[33px] font-bold md:text-2xl md:leading-[40px]">
          {name}
        </h1>

        {affiliation && (
          <p className="font-ibm-plex text-foreground-muted flex items-center gap-2 text-sm leading-[23px] font-medium md:text-base md:leading-[26px]">
            <Building2 aria-hidden="true" className="size-4 shrink-0 md:size-5" />
            {affiliation.label}
          </p>
        )}

        {categories.length > 0 && (
          <ul className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Tag color={category.fontColor} bgColor={category.backgroundColor}>
                  {category.label}
                </Tag>
              </li>
            ))}
          </ul>
        )}
      </div>
    </header>
  );
}
