type ActivityListShellProps = {
  children: React.ReactNode;
};

/**
 * The frame around the activity list — its heading, and the column the list sits in. The page
 * and its `loading.tsx` both render it, so the loading state lines up with the page it stands in
 * for and the heading stays put when the real page replaces it.
 */
export function ActivityListShell({ children }: ActivityListShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-[1512px] flex-col gap-6 px-5 pt-5 pb-8 md:gap-8 md:px-8 md:pt-10 md:pb-16 xl:px-25">
      <header className="mx-auto flex w-full max-w-[680px] flex-col gap-1 text-center">
        <h1 className="font-ibm-plex text-primary text-[32px] leading-[53px] font-semibold md:text-5xl md:leading-[79px]">
          กิจกรรมทั้งหมด
        </h1>
        <p className="font-ibm-plex text-foreground-muted text-base leading-[26px] md:text-xl md:leading-[33px]">
          ทุกกิจกรรม ทุกการแข่งขัน ทุกโอกาสจากหลากหลายชมรมจุฬาฯ ในที่เดียว
        </p>
      </header>

      <div className="md:px-8">{children}</div>
    </main>
  );
}
