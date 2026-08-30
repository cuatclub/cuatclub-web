"use client";

import { useState, type RefObject } from "react";
import { X } from "lucide-react";

import { ClubSortSelect } from "@/app/(site)/clubs/_components/ClubSortSelect";
import type { ClubListParams } from "@/app/(site)/clubs/_lib/club-list-params";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { DialogClose, DialogContent, DialogRoot, DialogTitle } from "@/components/ui/Dialog";
import { api, type RouterOutputs } from "@/trpc/react";

type Category = RouterOutputs["masterData"]["categories"]["getAll"][number];

/** The slice of the list's state this panel edits. */
export type ClubFilterSelection = Pick<ClubListParams, "categoryIds" | "affiliationIds" | "sort">;

const sectionTitleClass =
  "font-ibm-plex text-foreground text-sm leading-[23px] font-semibold md:text-base md:leading-[26px]";

/** Tailwind's `md`, where the drawer becomes a card anchored under the search bar. */
const DESKTOP_QUERY = "(min-width: 48rem)";

type ClubFilterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opens the panel, so a click on it can toggle instead of dismiss-then-reopen. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** Already loaded by the list, so the panel opens with its categories in place. */
  categories: Category[];
  selection: ClubFilterSelection;
  onApply: (selection: ClubFilterSelection) => void;
};

/**
 * Every filter in one panel — a drawer on a phone, a card dropping out of the search bar on a
 * desktop. It is the only way to filter by affiliation, and on a phone the only way to filter or
 * sort at all.
 *
 * The desktop card is deliberately **not** modal: the design gives it no scrim, and a scroll lock
 * would strand its footer below the fold on a short window, since the card is anchored in the page
 * rather than pinned to the viewport.
 */
export function ClubFilterModal({
  open,
  onOpenChange,
  triggerRef,
  categories,
  selection,
  onApply,
}: ClubFilterModalProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} modal={!isDesktop}>
      {/* Held to the height of the Figma frame, so the panel stays a panel and the list it is
          filtering keeps showing through behind it. */}
      <DialogContent
        placement="anchored"
        aria-describedby={undefined}
        className="md:max-h-[537px]"
        onInteractOutside={(event) => {
          // Without a scrim the filter button is reachable while the panel is open, so let the
          // button own the toggle rather than dismissing here and reopening on its click.
          const target = event.target;
          if (target instanceof Node && triggerRef.current?.contains(target)) {
            event.preventDefault();
          }
        }}
      >
        {/* Mounted only while open, so the draft below starts from the applied filters every time. */}
        <ClubFilterForm
          categories={categories}
          selection={selection}
          onApply={(next) => {
            onApply(next);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </DialogRoot>
  );
}

type ClubFilterFormProps = {
  categories: Category[];
  selection: ClubFilterSelection;
  onApply: (selection: ClubFilterSelection) => void;
};

/**
 * Choices are staged rather than applied as they are made: ticking six affiliations should cost
 * one query, and the list behind the panel shouldn't reshuffle underneath a half-made decision.
 */
function ClubFilterForm({ categories, selection, onApply }: ClubFilterFormProps) {
  const [draft, setDraft] = useState<ClubFilterSelection>(selection);

  const { data: affiliations, isPending } = api.masterData.affiliations.getAll.useQuery({});

  const toggle = (key: "categoryIds" | "affiliationIds", id: number) =>
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((value) => value !== id)
        : [...current[key], id],
    }));

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 md:px-6 md:pt-6">
        <DialogTitle className="text-primary">ตัวกรอง</DialogTitle>
        <DialogClose
          aria-label="ปิด"
          className="text-placeholder hover:text-foreground focus-visible:ring-primary shrink-0 cursor-pointer rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <X aria-hidden="true" className="size-5" />
        </DialogClose>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 md:px-6">
        <section className="flex flex-col gap-3 pb-4">
          <h3 className={sectionTitleClass}>หมวดหมู่</h3>
          {categories.length === 0 ? (
            <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px]">
              ยังไม่มีหมวดหมู่ให้เลือก
            </p>
          ) : (
            <OptionCheckboxes
              options={categories}
              selectedIds={draft.categoryIds}
              onToggle={(id) => toggle("categoryIds", id)}
            />
          )}
        </section>

        <section className="border-border flex flex-col gap-3 border-t py-5">
          <h3 className={sectionTitleClass}>คณะ/สังกัด</h3>
          {isPending ? (
            <div className="flex flex-wrap gap-x-4 gap-y-2 md:gap-y-3">
              {Array.from({ length: 12 }, (_, index) => (
                <div key={index} className="bg-surface h-5 w-32 animate-pulse rounded" />
              ))}
            </div>
          ) : (
            <OptionCheckboxes
              options={affiliations ?? []}
              selectedIds={draft.affiliationIds}
              onToggle={(id) => toggle("affiliationIds", id)}
            />
          )}
        </section>

        {/* Sorting isn't filtering, and the row above the results is desktop-only — so on a phone
            this panel is the only home the sort control has. */}
        <section className="border-border border-t py-5 md:hidden">
          <ClubSortSelect
            value={draft.sort}
            onValueChange={(sort) => setDraft((current) => ({ ...current, sort }))}
            className="w-full"
          />
        </section>
      </div>

      {/* The confirm button leads on a phone and closes the row on a desktop, so it reads as the
          end of the panel either way. */}
      <div className="border-border flex flex-col gap-3 border-t px-5 py-4 md:flex-row-reverse md:items-center md:justify-between md:px-6 md:py-5">
        <Button onClick={() => onApply(draft)} className="w-full md:w-auto">
          ยืนยัน
        </Button>
        <button
          type="button"
          onClick={() =>
            setDraft((current) => ({ ...current, categoryIds: [], affiliationIds: [] }))
          }
          className="font-ibm-plex text-placeholder hover:text-foreground focus-visible:ring-primary cursor-pointer self-center rounded-sm text-sm leading-[23px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:self-auto md:text-base md:leading-[26px]"
        >
          ล้างทั้งหมด
        </button>
      </div>
    </>
  );
}

type OptionCheckboxesProps = {
  options: { id: number; label: string }[];
  selectedIds: number[];
  onToggle: (id: number) => void;
};

/** One flowing row of ticks per section — the labels are all different lengths, so they wrap
 *  where they land rather than into columns sized for the longest faculty name. */
function OptionCheckboxes({ options, selectedIds, onToggle }: OptionCheckboxesProps) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 md:gap-y-3">
      {options.map((option) => (
        <label key={option.id} className="flex cursor-pointer items-center gap-2">
          <Checkbox
            checked={selectedIds.includes(option.id)}
            onCheckedChange={() => onToggle(option.id)}
          />
          <span className="font-ibm-plex text-foreground text-xs leading-[20px] md:text-sm md:leading-[23px]">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );
}
