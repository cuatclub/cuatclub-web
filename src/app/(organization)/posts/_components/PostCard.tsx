// PostCard is extracted as its own component so that useQuery (a hook)
// is called at the top level of a component — not inside a .map() callback,

import { useSession } from "@/lib/auth-client";
import { api } from "@/trpc/react";
import { SquarePen, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export const themeColor = ["#DF5C8E", "#4369c1", "#c16ddd", "#e7935f", "#5cc27e", "#e0e05b", "#5bc0eb", "#9bc53d", "#fdb462", "#ef3b2c"] as const;

// which would violate the Rules of Hooks.
export const PostCard = ({ event }: { event: any }) => {
    const { data: session } = useSession();
    const router = useRouter();

    const date = new Date(event.date);
    const formatter = Intl.DateTimeFormat("th-TH", {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
    const closeDate = formatter.format(date);

    const { data: tags } = api.interestXPost.getAllByPostId.useQuery({ postId: event.id }, {
        enabled: !!session?.user.id || true
    });

    return (
        <div className="border-1 border-stroke rounded-[12px] py-[10px] px-[10px] lg:py-5 lg:px-6 h-[358px] sm:h-[213px] lg:h-[266px] flex sm:flex-row flex-col justify-center sm:gap-x-5 gap-y-[10px] hover:cursor-pointer hover:bg-calendar-item-hover duration-150"
            onClick={(e) => {
                const target = e.target as Element;
                if (target.tagName !== "svg" && target.tagName !== "path") {
                    router.push(`/posts/${event.id}`);
                }
            }}
        >
            <div className="relative h-[191px] w-full sm:h-[190px] lg:h-[226px] sm:w-42.5 rounded-[12px] bg-primary shrink-0 overflow-hidden">
                <Image
                    className="h-full w-full object-cover rounded-[12px]"
                    src={event.image}
                    alt={event.title}
                    fill
                    sizes="(max-width: 640px) 190px, (max-width: 1024px) 226px, 226px"
                    quality={90}
                />
            </div>
            <div className="min-w-0 h-[150px] sm:h-[193px] lg:h-[226px] flex-1 flex flex-col justify-between">
                <div className="flex flex-col gap-y-[5px]">
                    <div>
                        <div className="flex items-center gap-x-2 sm:gap-x-0 sm:justify-between">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-4">
                                <div className="font-semibold lg:text-xl sm:text-lg text-xs text-base line-clamp-1 sm:line-clamp-2">{event.title}</div>
                                <div className="items-center text-primary gap-x-2 flex">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                    <div className="font-semibold text-xs sm:text-sm lg:text-base">{event.activityTypeName}</div>
                                </div>
                            </div>
                            <div className="hidden text-text-gray flex gap-x-3">
                                <SquarePen className="hidden sm:block hover:cursor-pointer lg:w-6 lg:h-6 sm:w-5 sm:h-5" />
                                <Trash2 className="hidden sm:block hover:cursor-pointer hover:text-red-600 hover:opacity-80 lg:w-6 lg:h-6 sm:w-5 sm:h-5" />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-x-2 gap-y-0.75 text-[0.75rem] h-[22px] sm:h-[26px] items-center text-white flex-wrap overflow-hidden">
                        {(tags ?? []).map((tag: any, idx) => (
                            <div key={idx} className="text-[8px] sm:text-xs px-2 sm:px-2.5 py-1 rounded-[6px] shrink-0" style={{ backgroundColor: themeColor[idx % themeColor.length] }}>{tag.name}</div>
                        ))}
                    </div>
                    <div className="break-words hidden w-full mt-1 text-text-gray line-clamp-3 sm:line-clamp-3 lg:line-clamp-5 text-[10px] sm:text-sm lg:text-base font-light tracking-tight">
                        {event.description}
                    </div>
                    {/* <div className="text-wrap w-full mt-1 text-text-gray line-clamp-3 sm:line-clamp-3 lg:line-clamp-5 text-[10px] sm:text-sm lg:text-base font-light tracking-tight border-1 border-red-500">
                        {event.description}
                    </div> */}
                </div>
                <div className="flex-col lg:flex-row flex justify-between lg:text-base sm:text-[13px] text-[8px]">
                    <div className="hidden sm:flex justify-between">
                        <div className="flex gap-1">
                            <span className="font-semibold shrink-0">ฟอร์มรับสมัคร : </span>
                            <Link href={event.instaLink ?? "#"} target="_blank" className="text-text-gray truncate hover:underline">{event.instaLink ?? "-"}</Link>
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <div className="flex gap-1 truncate">
                            <span className="font-semibold shrink-0">ปิดรับสมัคร : </span>
                            <span className="text-text-gray truncate">{closeDate}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-y-1 sm:hidden">
                    <button className="w-full h-[24px] text-[10px] text-text-light-gray flex justify-center items-center rounded-[4px] border-stroke border-1 cursor-pointer hover:bg-[#f2f2f2] hover:text-text-gray">แก้ไข</button>
                    <button className="w-full h-[24px] text-[10px] text-text-light-gray flex justify-center items-center rounded-[4px] border-stroke border-1 cursor-pointer hover:text-red-500 hover:border-red-500">ลบทิ้ง</button>
                </div>
            </div>
        </div >
    );
};