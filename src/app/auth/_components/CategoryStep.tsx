import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, BriefcaseBusiness, Cpu, GraduationCap, HandHeart, HeartPulse, Monitor, Music, Palette, Volleyball } from "lucide-react";
import { api } from "@/trpc/react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

const iconMap = {
  BriefcaseBusiness,
  Cpu,
  HeartPulse,
  Volleyball,
  HandHeart,
  Monitor,
  Palette,
  Music,
  GraduationCap,
} as const;

interface CategoryStepProps {
  onBack: () => void;
  type?: "attendee" | "organizer";
}

export default function CategoryStep({
  onBack,
  type = "organizer",
}: CategoryStepProps) {

  const [selected, setSelected] = useState<string[]>([]);
  const router = useRouter();

  const canContinue = selected.length > 0;
  const title = type === "attendee" ? "สิ่งที่สนใจ" : "เลือกหมวดหมู่";

  const { data: interests } = api.interest.getAll.useQuery();
  const { data: me } = api.user.me.useQuery(undefined, { enabled: type === "attendee" });
  const { data: mine } = api.organization.getMine.useQuery(undefined, {
    enabled: type === "organizer",
  });
  const utils = api.useUtils();
  const { refetch: refetchSession } = useSession();
  const updateInterests = api.user.updateInterests.useMutation();
  const setMineInterests = api.organization.setMineInterests.useMutation({
    onSuccess: async () => {
      await utils.organization.getMine.invalidate();
    },
  });
  const completeOnboarding = api.user.completeOnboarding.useMutation();

  useEffect(() => {
    if (type === "attendee" && me?.interests) setSelected(me.interests);
  }, [type, me]);

  useEffect(() => {
    if (type === "organizer" && mine?.interests) setSelected(mine.interests);
  }, [type, mine]);

  const byId = useMemo(() => interests ?? [], [interests]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const handleSubmit = async () => {
    if (type === "organizer") {
      await setMineInterests.mutateAsync({ interestIds: selected });
    } else {
      await updateInterests.mutateAsync({ interests: selected });
    }
    await completeOnboarding.mutateAsync();
    await refetchSession({ query: { disableCookieCache: true } });
    await utils.user.me.invalidate();
    await utils.organization.getMine.invalidate();
    router.push(type === "attendee" ? "/feed" : "/posts");
  };
  
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex items-center justify-between">
        <ArrowLeft
          className="cursor-pointer text-text-gray hover:text-text-gray-hover"
          onClick={onBack}
        />
        <h1 className="text-xl sm:text-2xl">{title}</h1>
        <ArrowLeft className="text-white" />
      </div>

      <div className="mx-auto grid grid-cols-3 gap-4 text-sm sm:gap-6 sm:text-base">
        {byId.map((interest) => {
          const Icon = interest.icon ? iconMap[interest.icon as keyof typeof iconMap] : BriefcaseBusiness;
          const active = selected.includes(interest.id);

          return (
            <button
              key={interest.id}
              onClick={() => toggle(interest.id)}
              className="flex cursor-pointer flex-col items-center gap-2"
            >
              <div
                className={`rounded-full border-2 p-4 ${
                  active ? "border-primary bg-primary" : "border-primary"
                }`}
              >
                <Icon
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${
                    active ? "text-white" : "text-primary"
                  }`}
                />
              </div>
              <p>{interest.name}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-4">
        <Button
          disabled={!canContinue || setMineInterests.isPending || updateInterests.isPending}
          onClick={() => void handleSubmit()}
        >
          {setMineInterests.isPending || updateInterests.isPending ? "กำลังบันทึก..." : "เสร็จสิ้น"}
        </Button>

        <div className="flex w-full items-center justify-center gap-1.5">
          {type === "attendee" ? (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-[#d4d4d4]" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#949494]" />
            </>
          ) : (
            <>
              <div className="h-1.5 w-1.5 rounded-full bg-[#d4d4d4]" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#d4d4d4]" />
              <div className="h-1.5 w-1.5 rounded-full bg-[#949494]" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}