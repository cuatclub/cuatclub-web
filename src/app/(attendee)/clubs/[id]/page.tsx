"use client";

import { use } from "react";
import { ArrowLeft, Check, ExternalLink, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/ui/Footer";
import { Navbar } from "@/components/ui/Navbar";
import { api } from "@/trpc/react";

const formatDate = (value?: Date) =>
	value
		? new Intl.DateTimeFormat("th-TH", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}).format(new Date(value))
		: null;

const instagramHref = (value: string) =>
	value.startsWith("http") ? value : `https://www.instagram.com/${value.replace(/^@/, "")}`;

export default function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const router = useRouter();
	const utils = api.useUtils();
	const { data: club, isLoading, error } = api.organization.getClub.useQuery({ id });
	const { data: followedIds = [] } = api.userXOrganization.getMineFollowed.useQuery();
	const followed = followedIds.includes(id);
	const followMutation = api.userXOrganization.follow.useMutation({
		onSuccess: async () => utils.userXOrganization.getMineFollowed.invalidate(),
	});
	const unfollowMutation = api.userXOrganization.unfollow.useMutation({
		onSuccess: async () => utils.userXOrganization.getMineFollowed.invalidate(),
	});
	const followBusy = followMutation.isPending || unfollowMutation.isPending;
	const followError = followMutation.error?.message ?? unfollowMutation.error?.message;

	const toggleFollow = () => {
		if (followed) {
			unfollowMutation.mutate({ organizationId: id });
		} else {
			followMutation.mutate({ organizationId: id });
		}
	};

	const recruitment = club?.recruitmentPeriod;
	const recruitmentText = recruitment?.allYear
		? "เปิดรับสมัครตลอดปี"
		: [formatDate(recruitment?.start), formatDate(recruitment?.end)].filter(Boolean).join(" – ") || "ไม่ระบุ";

	return (
		<div className="min-h-screen bg-[#fbfbfc] text-[#34383d]">
			<Navbar />
			<main className="body-section">
				<button
					type="button"
					onClick={() => router.back()}
					className="flex items-center gap-2 self-start text-sm font-medium text-[#777e86] hover:text-primary"
				>
					<ArrowLeft className="h-5 w-5" />
					ย้อนกลับ
				</button>

				{isLoading ? (
					<div className="flex min-h-80 items-center justify-center text-text-gray">กำลังโหลด...</div>
				) : error || !club ? (
					<div className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
						<h1 className="text-2xl font-bold">ไม่พบชมรม</h1>
						<p className="text-text-gray">ชมรมนี้อาจถูกลบหรือไม่เปิดให้เข้าชม</p>
						<Button asChild variant="outline">
							<Link href="/clubs">กลับไปหน้าชมรม</Link>
						</Button>
					</div>
				) : (
					<div className="grid w-full gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
						<aside className="flex flex-col items-center rounded-[24px] border border-stroke bg-white p-6 text-center shadow-sm">
							{club.image ? (
								<Image
									src={club.image}
									alt={club.name}
									width={176}
									height={176}
									className="h-44 w-44 rounded-full object-cover"
								/>
							) : (
								<div className="h-44 w-44 rounded-full bg-gray-200" />
							)}
							<h1 className="mt-5 text-3xl font-bold">{club.name}</h1>
							{club.socials?.instagram && (
								<a
									href={instagramHref(club.socials.instagram)}
									target="_blank"
									rel="noreferrer"
									className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
								>
									{club.socials.instagram}
									<ExternalLink className="h-3.5 w-3.5" />
								</a>
							)}
							<Button
								type="button"
								disabled={followBusy}
								onClick={toggleFollow}
								className="mt-6 w-full rounded-full"
								variant={followed ? "secondary" : "default"}
							>
								{followed ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
								{followed ? "ติดตามแล้ว" : "ติดตามชมรม"}
							</Button>
							{followError && <p className="mt-3 text-sm text-red-600">{followError}</p>}
						</aside>

						<section className="min-w-0 space-y-6">
							<div className="rounded-[24px] border border-stroke bg-white p-6 shadow-sm sm:p-8">
								<h2 className="text-2xl font-bold">เกี่ยวกับชมรม</h2>
								<p className="mt-4 whitespace-pre-wrap leading-7 text-[#666d75]">
									{club.bio ?? "ยังไม่มีรายละเอียดชมรม"}
								</p>
							</div>

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="rounded-[20px] border border-stroke bg-white p-5">
									<p className="text-sm font-semibold text-[#8a9198]">ช่วงรับสมัคร</p>
									<p className="mt-2 font-medium">{recruitmentText}</p>
								</div>
								<div className="rounded-[20px] border border-stroke bg-white p-5">
									<p className="text-sm font-semibold text-[#8a9198]">เวลาเฉลี่ยต่อสัปดาห์</p>
									<p className="mt-2 font-medium">
										{club.averageHoursPerWeek != null ? `${club.averageHoursPerWeek} ชั่วโมง` : "ไม่ระบุ"}
									</p>
								</div>
							</div>

							<div className="rounded-[24px] border border-stroke bg-white p-6 shadow-sm sm:p-8">
								<h2 className="text-xl font-bold">หมวดหมู่ความสนใจ</h2>
								<div className="mt-4 flex flex-wrap gap-2">
									{club.interests.length > 0 ? (
										club.interests.map(({ interest }) => (
											<span
												key={interest.id}
												className="rounded-full bg-[#fff1f6] px-4 py-2 text-sm font-medium text-primary"
											>
												{interest.name}
											</span>
										))
									) : (
										<p className="text-sm text-text-gray">ยังไม่มีหมวดหมู่</p>
									)}
								</div>
							</div>
						</section>
					</div>
				)}
			</main>
			<Footer />
		</div>
	);
}
