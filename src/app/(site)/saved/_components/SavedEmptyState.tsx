import Image from "next/image";
import { SearchX } from "lucide-react";

/** The visitor hasn't saved anything yet. */
export function NoSavedActivities() {
  return (
    <div className="flex flex-col items-center py-12 text-center md:py-20">
      <Image
        src="/svg/no-saved-post.svg"
        alt=""
        width={262}
        height={210}
        className="h-auto w-[188px] md:w-[262px]"
      />
      <p className="font-ibm-plex text-primary mt-9 text-xl leading-[normal] font-bold md:text-[28px]">
        ยังไม่มีโพสต์ที่บันทึกไว้
      </p>
      <p className="font-ibm-plex text-foreground-secondary mt-1 text-sm leading-[normal] md:text-base">
        โพสต์ที่คุณบันทึกจะแสดงอยู่ที่นี่
      </p>
    </div>
  );
}

/** Something is saved, but nothing matches the search. */
export function NoSavedSearchResults() {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <SearchX aria-hidden="true" className="text-placeholder size-10" />
      <p className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold md:text-lg md:leading-[30px]">
        ไม่พบโพสต์ที่ตรงกับคำค้นหา
      </p>
      <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px] md:text-base md:leading-[26px]">
        ลองใช้คำค้นหาอื่น
      </p>
    </div>
  );
}
