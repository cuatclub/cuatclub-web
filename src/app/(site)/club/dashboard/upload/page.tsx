import { api } from "@/trpc/server";
import { CreatePostFormContainer } from "@/app/(site)/club/dashboard/upload/_components/CreatePostFormContainer";

export default async function UploadPostPage() {
  const [activityTypes, categories, faculties] = await Promise.all([
    api.masterData.activityTypes.getAll({}),
    api.masterData.categories.getAll({}),
    api.masterData.faculties.getAll({}),
  ]);

  return (
    <div className="flex w-full flex-col gap-6 md:gap-9">
      <div className="flex flex-col gap-1">
        <h1 className="font-ibm-plex text-primary text-[28px] leading-[38px] font-bold">
          สร้างโพสต์
        </h1>
        <p className="font-ibm-plex text-foreground-secondary text-base font-medium">
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
