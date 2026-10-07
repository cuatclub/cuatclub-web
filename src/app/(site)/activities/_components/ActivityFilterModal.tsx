"use client";

import { useState, type ReactNode, type RefObject } from "react";
import { ChevronDown, X } from "lucide-react";

import { ActivitySortSelect } from "@/app/(site)/activities/_components/ActivitySortSelect";
import type { ActivityListParams } from "@/app/(site)/activities/_lib/activity-list-params";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { DialogClose, DialogContent, DialogRoot, DialogTitle } from "@/components/ui/Dialog";
import { RadioGroup } from "@/components/ui/RadioGroup";
import { cn } from "@/lib/utils";
import { api, type RouterOutputs } from "@/trpc/react";

type Category = RouterOutputs["masterData"]["categories"]["getAll"][number];
type Audience = NonNullable<ActivityListParams["audience"]>;

const AUDIENCE_OPTIONS: { id: Audience; label: string }[] = [
  { id: "CHULA_STUDENT", label: "นิสิตจุฬาฯ" },
  { id: "GENERAL_PUBLIC", label: "บุคคลทั่วไป" },
];

const YEAR_LEVEL_OPTIONS = [1, 2, 3, 4] as const;

/** The slice of the list's state this panel edits. */
export type ActivityFilterSelection = Pick<
  ActivityListParams,
  "categoryIds" | "activityTypeIds" | "facultyIds" | "audience" | "yearLevels" | "sort"
>;

const sectionTitleClass =
  "font-ibm-plex text-foreground text-sm leading-[23px] font-semibold md:text-base md:leading-[26px]";

/** Tailwind's `md`, where the drawer becomes a card anchored under the search bar. */
const DESKTOP_QUERY = "(min-width: 48rem)";

type ActivityFilterModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The button that opens the panel, so a click on it can toggle instead of dismiss-then-reopen. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  /** Already loaded by the list, so the panel opens with its categories in place. */
  categories: Category[];
  selection: ActivityFilterSelection;
  onApply: (selection: ActivityFilterSelection) => void;
};

/**
 * Every filter in one panel — a drawer on a phone, a card dropping out of the search bar on a
 * desktop. It is the only way to filter by activity type/audience/year/faculty, and on a phone
 * the only way to filter or sort at all.
 */
export function ActivityFilterModal({
  open,
  onOpenChange,
  triggerRef,
  categories,
  selection,
  onApply,
}: ActivityFilterModalProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange} modal={!isDesktop}>
      <DialogContent
        placement="anchored"
        aria-describedby={undefined}
        className="md:max-h-[600px]"
        onInteractOutside={(event) => {
          const target = event.target;
          if (target instanceof Node && triggerRef.current?.contains(target)) {
            event.preventDefault();
          }
        }}
      >
        <ActivityFilterForm
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

type ActivityFilterFormProps = {
  categories: Category[];
  selection: ActivityFilterSelection;
  onApply: (selection: ActivityFilterSelection) => void;
};

/**
 * Choices are staged rather than applied as they are made: ticking several faculties should cost
 * one query, and the list behind the panel shouldn't reshuffle underneath a half-made decision.
 */
function ActivityFilterForm({ categories, selection, onApply }: ActivityFilterFormProps) {
  const [draft, setDraft] = useState<ActivityFilterSelection>(selection);

  const { data: activityTypes, isPending: isActivityTypesPending } =
    api.masterData.activityTypes.getAll.useQuery({});
  const { data: faculties, isPending: isFacultiesPending } =
    api.masterData.faculties.getAll.useQuery({});

  const toggle = (key: "categoryIds" | "activityTypeIds" | "facultyIds", id: number) =>
    setDraft((current) => ({
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((value) => value !== id)
        : [...current[key], id],
    }));

  const toggleYearLevel = (level: number) =>
    setDraft((current) => ({
      ...current,
      yearLevels: current.yearLevels.includes(level)
        ? current.yearLevels.filter((value) => value !== level)
        : [...current.yearLevels, level],
    }));

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-5 pt-5 pb-4 md:px-6 md:pt-6 md:pb-0">
        <DialogTitle className="text-primary font-bold">ตัวกรอง</DialogTitle>
        <DialogClose
          aria-label="ปิด"
          className="text-placeholder hover:text-foreground focus-visible:ring-primary shrink-0 cursor-pointer rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          <X aria-hidden="true" className="size-5" />
        </DialogClose>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 md:px-6 md:py-4">
        <FilterSection title="หมวดหมู่">
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
        </FilterSection>

        <hr className="border-border" />

        <FilterSection title="ประเภทกิจกรรม">
          {isActivityTypesPending ? (
            <FilterOptionsSkeleton />
          ) : (
            <OptionCheckboxes
              options={activityTypes ?? []}
              selectedIds={draft.activityTypeIds}
              onToggle={(id) => toggle("activityTypeIds", id)}
            />
          )}
        </FilterSection>

        <hr className="border-border" />

        <FilterSection title="คุณสมบัติ">
          <div className="flex flex-col gap-3 pl-2">
            <RadioGroup
              label="ผู้มีสิทธิ์เข้าร่วม"
              size="sm"
              options={AUDIENCE_OPTIONS.map((option) => ({
                value: option.id,
                label: option.label,
              }))}
              value={draft.audience}
              onValueChange={(audience) => setDraft((current) => ({ ...current, audience }))}
            />

            <div className="flex flex-col gap-2">
              <h4 className="font-ibm-plex text-foreground text-xs leading-[20px] font-semibold md:text-sm md:leading-[23px]">
                ชั้นปี
              </h4>
              <div className="flex flex-wrap gap-x-4 gap-y-2">
                {YEAR_LEVEL_OPTIONS.map((level) => (
                  <label key={level} className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      checked={draft.yearLevels.includes(level)}
                      onCheckedChange={() => toggleYearLevel(level)}
                    />
                    <span className="font-ibm-plex text-foreground text-xs leading-[20px] md:text-sm md:leading-[23px]">
                      ปี {level}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="font-ibm-plex text-foreground text-xs leading-[20px] font-semibold md:text-sm md:leading-[23px]">
                คณะ
              </h4>
              {isFacultiesPending ? (
                <FilterOptionsSkeleton />
              ) : (
                <div className="max-h-64 overflow-y-auto pr-1">
                  <OptionCheckboxes
                    options={faculties ?? []}
                    selectedIds={draft.facultyIds}
                    onToggle={(id) => toggle("facultyIds", id)}
                  />
                </div>
              )}
            </div>
          </div>
        </FilterSection>

        <hr className="border-border md:hidden" />

        <section className="py-5 md:hidden">
          <ActivitySortSelect
            value={draft.sort}
            onValueChange={(sort) => setDraft((current) => ({ ...current, sort }))}
            className="w-full"
          />
        </section>
      </div>

      <div className="border-border flex flex-col gap-3 border-t px-5 py-4 md:flex-row-reverse md:items-center md:justify-between md:px-6 md:py-5">
        <Button onClick={() => onApply(draft)} className="w-full md:w-auto">
          ยืนยัน
        </Button>
        <button
          type="button"
          onClick={() =>
            setDraft((current) => ({
              ...current,
              categoryIds: [],
              activityTypeIds: [],
              facultyIds: [],
              audience: undefined,
              yearLevels: [],
            }))
          }
          className="font-ibm-plex text-placeholder hover:text-foreground focus-visible:ring-primary cursor-pointer self-center rounded-sm text-sm leading-[23px] transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none md:self-auto md:text-base md:leading-[26px]"
        >
          ล้างทั้งหมด
        </button>
      </div>
    </>
  );
}

type FilterSectionProps = {
  title: string;
  children: ReactNode;
};

/** One collapsible facet group — matches the design's chevron-per-section accordion, so a long
 *  panel (faculty's list runs to dozens of rows) can be collapsed back down to just its title. */
function FilterSection({ title, children }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="focus-visible:ring-primary flex w-full cursor-pointer items-center justify-between rounded-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <h3 className={sectionTitleClass}>{title}</h3>
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "text-foreground-muted size-5 shrink-0 transition-transform duration-200 motion-reduce:transition-none",
            isOpen && "rotate-180"
          )}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-200 ease-in-out motion-reduce:transition-none",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pt-4">{children}</div>
        </div>
      </div>
    </section>
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
    <div className="flex flex-wrap gap-x-4 gap-y-2">
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

function FilterOptionsSkeleton() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2">
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className="bg-surface h-5 w-24 animate-pulse rounded" />
      ))}
    </div>
  );
}
