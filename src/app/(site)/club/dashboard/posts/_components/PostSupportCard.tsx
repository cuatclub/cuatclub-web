import { buttonVariants } from "@/components/ui";
import { cn } from "@/lib/utils";

// No contact page exists; this is the Instagram handle the footer and RegisterForm point to.
const CONTACT_URL = "https://www.instagram.com/cuatclub.chula/";

type PostSupportCardProps = {
  className?: string;
};

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
