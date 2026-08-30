type ClubAboutProps = {
  description: string;
};

export function ClubAbout({ description }: ClubAboutProps) {
  return (
    <section className="flex max-w-[1111px] flex-col gap-2">
      <h2 className="font-ibm-plex text-foreground text-base leading-[26px] font-semibold md:text-xl md:leading-[33px]">
        เกี่ยวกับ
      </h2>
      <p className="font-ibm-plex text-foreground text-sm leading-[23px] whitespace-pre-line md:text-base md:leading-[26px]">
        {description}
      </p>
    </section>
  );
}
