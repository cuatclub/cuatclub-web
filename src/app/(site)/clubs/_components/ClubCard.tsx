import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";

import { Tag } from "@/components/ui/Tag";
import type { RouterOutputs } from "@/trpc/react";

type Club = RouterOutputs["clubs"]["getAll"]["clubs"][number];

/** Cards share a row height, so only the first couple of categories fit beside the logo. */
const MAX_VISIBLE_CATEGORIES = 2;

type ClubCardProps = {
  id: Club["id"];
  name: Club["name"];
  logoUrl: Club["logoUrl"];
  shortDescription: Club["shortDescription"];
  affiliation: Club["affiliation"];
  categories: Club["categories"];
};

/**
 * A single club in the club list. The whole card is one link to the club's page — the
 * "เพิ่มเติม" row is the visual affordance for it, not a second control, so keyboard users
 * tab through one stop per card instead of two.
 */
export function ClubCard({
  id,
  name,
  logoUrl,
  shortDescription,
  affiliation,
  categories,
}: ClubCardProps) {
  const visibleCategories = categories.slice(0, MAX_VISIBLE_CATEGORIES);
  const hiddenCategoryCount = categories.length - visibleCategories.length;

  return (
    <Link
      href={`/clubs/${id}`}
      className="hover:border-primary-light focus-visible:ring-primary group flex h-full flex-col gap-4 rounded-xl border border-white bg-white p-4 shadow-black transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt=""
            width={56}
            height={56}
            className="size-12 shrink-0 rounded-full object-cover md:size-14"
          />
        ) : (
          // No logo uploaded — stand in with the club's initial rather than a broken frame.
          <div
            aria-hidden="true"
            className="bg-primary-lighter text-primary font-ibm-plex flex size-12 shrink-0 items-center justify-center rounded-full text-xl font-bold md:size-14"
          >
            {name.charAt(0)}
          </div>
        )}

        {visibleCategories.length > 0 && (
          <ul className="flex flex-wrap items-center justify-end gap-1.5">
            {visibleCategories.map((category) => (
              <li key={category.id}>
                <Tag color={category.fontColor} bgColor={category.backgroundColor}>
                  {category.label}
                </Tag>
              </li>
            ))}
            {hiddenCategoryCount > 0 && (
              <li>
                <Tag>+{hiddenCategoryCount}</Tag>
              </li>
            )}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="font-ibm-plex text-foreground line-clamp-1 text-lg leading-[30px] font-semibold md:text-xl md:leading-[33px]">
          {name}
        </h3>
        {shortDescription && (
          <p className="font-ibm-plex text-foreground-muted line-clamp-4 text-sm leading-[21px] md:text-base md:leading-[24px]">
            {shortDescription}
          </p>
        )}
      </div>

      {/* Pushed to the bottom so the footer lines up across cards with different description lengths. */}
      <div className="border-border mt-auto border-t" />

      <div className="flex items-center justify-between gap-3">
        {affiliation ? (
          <p className="font-ibm-plex text-foreground-muted flex min-w-0 items-center gap-2 text-sm leading-[23px] font-medium md:text-base md:leading-[26px]">
            <Building2 aria-hidden="true" className="size-4 shrink-0 md:size-5" />
            <span className="truncate">{affiliation.label}</span>
          </p>
        ) : (
          <span />
        )}

        <span
          aria-hidden="true"
          className="font-ibm-plex text-primary flex shrink-0 items-center gap-2 text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
        >
          เพิ่มเติม
          <ArrowRight className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 md:size-5" />
        </span>
      </div>
    </Link>
  );
}
