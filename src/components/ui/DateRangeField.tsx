"use client";

import { useId, useMemo, useState } from "react";
import { Popover } from "radix-ui";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

const THAI_MONTHS_LONG = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
] as const;

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
] as const;

// Sunday-first, matching a standard month grid.
const THAI_WEEKDAYS_SHORT = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"] as const;

const BUDDHIST_YEAR_OFFSET = 543;

function startOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isBetween(day: Date, start: Date, end: Date): boolean {
  const time = startOfDay(day).getTime();
  return time > startOfDay(start).getTime() && time < startOfDay(end).getTime();
}

/** e.g. `new Date(2026, 8, 6)` -> "6 ก.ย. 2569" */
function toBuddhistDisplay(date: Date): string {
  return `${date.getDate()} ${THAI_MONTHS_SHORT[date.getMonth()]} ${
    date.getFullYear() + BUDDHIST_YEAR_OFFSET
  }`;
}

/** e.g. viewYear 2026, viewMonth 8 -> "กันยายน 2569" */
function toBuddhistMonthLabel(viewYear: number, viewMonth: number): string {
  return `${THAI_MONTHS_LONG[viewMonth]} ${viewYear + BUDDHIST_YEAR_OFFSET}`;
}

/**
 * A fixed 6-row (42-cell) grid for the given month, filled with the days from
 * the adjacent months so every cell is a real Date. `isCurrentMonth` lets the
 * caller dim the overflow days.
 */
function buildMonthGrid(
  viewYear: number,
  viewMonth: number
): { date: Date; isCurrentMonth: boolean }[] {
  const firstOfMonth = new Date(viewYear, viewMonth, 1);
  const gridStart = new Date(viewYear, viewMonth, 1 - firstOfMonth.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(
      gridStart.getFullYear(),
      gridStart.getMonth(),
      gridStart.getDate() + index
    );
    return { date, isCurrentMonth: date.getMonth() === viewMonth };
  });
}

function toISODate(date: Date): string {
  return startOfDay(date).toISOString().slice(0, 10);
}

export interface DateRangeFieldProps {
  label?: string;
  required?: boolean;
  startValue: Date | null;
  endValue: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  placeholder?: string;
  /** When set, two hidden inputs (`<name>Start` / `<name>End`) carry the ISO dates for native form submits. */
  name?: string;
  className?: string;
}

/**
 * Single trigger that opens a month calendar and captures a start/end date pair.
 * First click sets the start, the next click sets the end (an earlier click
 * restarts the range); hovering previews the span. Dates display in the Buddhist
 * era. Same label / required / error / errorMessage / name contract as
 * {@link TagSelection} and {@link Select}.
 */
export function DateRangeField({
  label,
  required,
  startValue,
  endValue,
  onChange,
  disabled = false,
  error,
  errorMessage,
  placeholder = "เลือกช่วงเวลา",
  name,
  className,
}: DateRangeFieldProps) {
  const labelId = useId();
  const errorId = useId();

  const [open, setOpen] = useState(false);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [viewDate, setViewDate] = useState<Date>(() => startOfDay(startValue ?? new Date()));

  const grid = useMemo(
    () => buildMonthGrid(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const rangeEnd = endValue ?? (startValue && !endValue ? hoverDate : null);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setViewDate(startOfDay(startValue ?? new Date()));
      setHoverDate(null);
    }
  };

  const handleDayClick = (day: Date) => {
    const picked = startOfDay(day);

    // No selection in progress (nothing picked, or a full range already set) -> start over.
    if (!startValue || (startValue && endValue)) {
      onChange(picked, null);
      return;
    }

    // A start is set, waiting for the end.
    if (picked < startOfDay(startValue)) {
      onChange(picked, null);
      return;
    }

    onChange(startValue, picked);
    setHoverDate(null);
    setOpen(false);
  };

  const shiftMonth = (delta: number) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  };

  const triggerLabel =
    startValue && endValue
      ? `${toBuddhistDisplay(startValue)} → ${toBuddhistDisplay(endValue)}`
      : startValue
        ? `${toBuddhistDisplay(startValue)} → …`
        : placeholder;

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      {label && (
        <span
          id={labelId}
          className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
        >
          {label} {required && <span className="text-error">*</span>}
        </span>
      )}

      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger
          type="button"
          disabled={disabled}
          aria-labelledby={label ? labelId : undefined}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? errorId : undefined}
          className={cn(
            "border-border font-ibm-plex group flex h-10 w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg border bg-white px-3 text-sm leading-[23px] transition-colors outline-none md:text-base md:leading-[26px]",
            "hover:border-primary-light focus-visible:border-primary data-[state=open]:border-primary",
            startValue ? "text-foreground" : "text-placeholder",
            "disabled:bg-border disabled:text-placeholder disabled:cursor-not-allowed",
            error && "border-error hover:border-error data-[state=open]:border-error"
          )}
        >
          <span className="truncate">{triggerLabel}</span>
          <CalendarDays className="text-placeholder size-4 shrink-0" aria-hidden="true" />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="border-border z-50 w-[19rem] rounded-lg border bg-white p-3 shadow-black"
          >
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="เดือนก่อนหน้า"
                onClick={() => shiftMonth(-1)}
                className="text-foreground-muted hover:bg-primary-lighter hover:text-primary flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
              </button>
              <span className="font-ibm-plex text-foreground text-sm font-semibold">
                {toBuddhistMonthLabel(viewDate.getFullYear(), viewDate.getMonth())}
              </span>
              <button
                type="button"
                aria-label="เดือนถัดไป"
                onClick={() => shiftMonth(1)}
                className="text-foreground-muted hover:bg-primary-lighter hover:text-primary flex size-8 cursor-pointer items-center justify-center rounded-lg transition-colors"
              >
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7">
              {THAI_WEEKDAYS_SHORT.map((weekday) => (
                <span
                  key={weekday}
                  className="font-ibm-plex text-placeholder flex h-8 items-center justify-center text-xs"
                >
                  {weekday}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7" onMouseLeave={() => setHoverDate(null)}>
              {grid.map(({ date, isCurrentMonth }) => {
                const isStart = !!(startValue && isSameDay(date, startValue));
                const isEnd = !!(rangeEnd && isSameDay(date, rangeEnd));
                const inRange = !!(startValue && rangeEnd && isBetween(date, startValue, rangeEnd));

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    aria-label={toBuddhistDisplay(date)}
                    aria-pressed={!!(isStart || isEnd)}
                    onMouseEnter={() => setHoverDate(date)}
                    onClick={() => handleDayClick(date)}
                    className={cn(
                      "font-ibm-plex relative flex h-9 items-center justify-center text-sm transition-colors",
                      "hover:bg-primary-lighter hover:text-primary cursor-pointer",
                      !isCurrentMonth && "text-placeholder",
                      isCurrentMonth && !isStart && !isEnd && "text-foreground",
                      inRange && "bg-primary-lighter text-primary",
                      (isStart || isEnd) &&
                        "bg-primary hover:bg-primary rounded-lg text-white hover:text-white"
                    )}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>

      {name && (
        <>
          <input
            type="hidden"
            name={`${name}Start`}
            value={startValue ? toISODate(startValue) : ""}
          />
          <input type="hidden" name={`${name}End`} value={endValue ? toISODate(endValue) : ""} />
        </>
      )}

      {error && errorMessage && (
        <span
          id={errorId}
          role="alert"
          className="font-ibm-plex text-error text-xs leading-[23px] md:text-sm"
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}
