"use client";

import { useId, useMemo, useState } from "react";
import { Popover } from "radix-ui";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  THAI_WEEKDAYS_SHORT,
  buildMonthGrid,
  isBetween,
  isSameDay,
  startOfDay,
  toBuddhistDisplay,
  toBuddhistMonthLabel,
} from "@/app/(site)/club/dashboard/upload/_lib/date";

type DateRangeFieldProps = {
  label: string;
  required?: boolean;
  startValue: Date | null;
  endValue: Date | null;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  placeholder?: string;
  onChange: (start: Date | null, end: Date | null) => void;
};

export function DateRangeField({
  label,
  required,
  startValue,
  endValue,
  disabled = false,
  error,
  errorMessage,
  placeholder = "เลือกช่วงเวลา",
  onChange,
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
    <div className="flex flex-col gap-1">
      <span
        id={labelId}
        className="font-ibm-plex text-foreground text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
      >
        {label} {required && <span className="text-error">*</span>}
      </span>

      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger
          type="button"
          disabled={disabled}
          aria-labelledby={labelId}
          aria-invalid={error}
          aria-describedby={error && errorMessage ? errorId : undefined}
          className={cn(
            "border-border font-ibm-plex group flex h-10 w-full cursor-pointer items-center justify-between gap-2.5 rounded-lg border bg-white px-3 text-sm leading-[23px] transition-colors outline-none md:text-base md:leading-[26px]",
            "hover:border-primary-light data-[state=open]:border-primary",
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
