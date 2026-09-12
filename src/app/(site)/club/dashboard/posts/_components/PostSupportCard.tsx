import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

// Same Instagram handle the public footer (`Footer.tsx`) links as the club's own contact
// channel, and the one `RegisterForm` already points clubs at for support ("ติดต่อขอรหัสเชิญ
// จากแอดมินผ่านทางไอจี @cuatclub.chula") — there's no dedicated contact page, so this is the
// least-surprising destination for "ติดต่อเรา" here too.
const CONTACT_URL = "https://www.instagram.com/cuatclub.chula/";

type PostSupportCardProps = {
  className?: string;
};

/**
 * The "My Posts" right rail: a static help card pointing clubs at support. Fixed width, hugs
 * its own content height (doesn't stretch to match the list column next to it).
 */
export function PostSupportCard({ className }: PostSupportCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-white bg-white p-6 shadow-black",
        className
      )}
    >
      <h2 className="font-ibm-plex text-primary text-base leading-[26px] font-bold md:text-lg md:leading-[30px]">
        พบปัญหาการใช้งาน
      </h2>
      <p className="font-ibm-plex text-foreground-muted text-sm leading-[23px]">
        หากพบปัญหาในการใช้งาน หรือต้องการความช่วยเหลือ สามารถติดต่อทีมงานของทาง cuatclub ได้เลย
        เราพร้อมช่วยเหลือและแนะนำการใช้งานให้กับคุณ
      </p>
      <a
        href={CONTACT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(buttonVariants(), "w-full")}
      >
        ติดต่อเรา
      </a>
    </div>
  );
}
