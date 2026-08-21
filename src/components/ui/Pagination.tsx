import { ChevronLeft, ChevronRight } from "lucide-react";

import { getPaginationRange, PAGINATION_ELLIPSIS } from "@/components/ui/pagination-range";
import { cn } from "@/lib/utils";

const focusClass =
  "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:outline-none";

const cellClass = `font-ibm-plex border-primary flex h-9 min-w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border px-3 text-sm leading-[23px] font-medium transition-colors md:h-[38px] md:min-w-[43px] md:px-4 md:text-base md:leading-[26px] ${focusClass}`;

const stepClass = `font-ibm-plex text-primary hover:text-primary/70 disabled:text-placeholder flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-lg px-2 text-sm leading-[23px] font-medium transition-colors disabled:cursor-not-allowed md:h-[38px] md:text-base md:leading-[26px] ${focusClass}`;

export interface PaginationProps {
  /** 1-based. Values outside the run are pulled back to the nearest real page. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * @example
 * <Pagination page={page} totalPages={12} onPageChange={setPage} />
 */
const Pagination = ({ page, totalPages, onPageChange, className }: PaginationProps) => {
  if (totalPages < 2) return null;

  // A link like `?page=99` on a four-page list would otherwise leave every control pointing at
  // another empty page, with no way back into the results.
  const current = Math.min(Math.max(page, 1), totalPages);

  return (
    <nav
      aria-label="แบ่งหน้า"
      className={cn("flex items-center justify-center gap-2 sm:gap-4 md:gap-5", className)}
    >
      <button
        type="button"
        aria-label="ก่อนหน้า"
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
        className={stepClass}
      >
        <ChevronLeft aria-hidden="true" className="size-4 shrink-0 md:size-5" />
        <span aria-hidden="true" className="hidden sm:inline">
          ก่อนหน้า
        </span>
      </button>

      {/* The page run keeps its own tighter rhythm — the steps sit further out on either side. */}
      <div className="flex items-center gap-2 md:gap-3">
        {getPaginationRange(current, totalPages).map((item, index) =>
          item === PAGINATION_ELLIPSIS ? (
            <span
              key={`${PAGINATION_ELLIPSIS}-${index}`}
              aria-hidden="true"
              className="font-ibm-plex text-primary shrink-0 text-sm leading-[23px] font-medium md:text-base md:leading-[26px]"
            >
              ...
            </span>
          ) : (
            <button
              key={item}
              type="button"
              aria-label={`หน้า ${item}`}
              aria-current={item === current ? "page" : undefined}
              onClick={() => onPageChange(item)}
              className={cn(
                cellClass,
                item === current ? "bg-primary text-white" : "text-primary hover:bg-primary-lighter"
              )}
            >
              {item}
            </button>
          )
        )}
      </div>

      <button
        type="button"
        aria-label="ถัดไป"
        disabled={current === totalPages}
        onClick={() => onPageChange(current + 1)}
        className={stepClass}
      >
        <span aria-hidden="true" className="hidden sm:inline">
          ถัดไป
        </span>
        <ChevronRight aria-hidden="true" className="size-4 shrink-0 md:size-5" />
      </button>
    </nav>
  );
};

export { Pagination };
