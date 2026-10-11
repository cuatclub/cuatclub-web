import { api } from "@/trpc/server";
import { CreatePostFormContainer } from "@/app/(site)/club/dashboard/posts/upload/_components/CreatePostFormContainer";

export default async function UploadPostPage() {
  const [activityTypes, categories, faculties] = await Promise.all([
    api.masterData.activityTypes.getAll({}),
    api.masterData.categories.getAll({}),
    api.masterData.faculties.getAll({}),
  ]);

  return (
    <div className="flex w-full flex-col gap-6 md:gap-9">
      <div className="flex flex-col">
        <h1 className="font-ibm-plex text-primary text-[24px] leading-[46px] font-bold md:text-[28px] md:leading-[38px]">
          สร้างโพสต์
        </h1>
        <p className="font-ibm-plex text-foreground-secondary text-sm leading-[23px] font-medium md:text-base md:leading-[normal]">
          อัพโหลดกิจกรรมใหม่ของคุณได้ที่นี่
        </p>
      </div>

      <CreatePostFormContainer
        activityTypes={activityTypes}
        categories={categories}
        faculties={faculties}
      />
    </div>
  );
}
