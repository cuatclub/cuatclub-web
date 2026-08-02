"use client";

import { use, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { api } from "@/trpc/react";
import { buildInterestThemes, FALLBACK_THEME } from "@/app/(attendee)/clubs/_components/interest-theme";

// Import our newly refactored components
import { ClubHeader } from "@/app/(attendee)/clubs/[id]/_components/ClubHeader";
import { ClubAboutAndContact } from "@/app/(attendee)/clubs/[id]/_components/ClubAboutAndContact";
import { ClubGallery } from "@/app/(attendee)/clubs/[id]/_components/ClubGallery";

// Helper to format dates
const formatDate = (value?: Date) =>
	value
		? new Intl.DateTimeFormat("th-TH", {
				day: "numeric",
				month: "long",
				year: "numeric",
			}).format(new Date(value))
		: null;

export default function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params);
	const router = useRouter();
	const interestsQuery = api.interest.getAll.useQuery();
	
	const { data: club, isLoading, error } = api.organization.getClub.useQuery({ id });

	if (club) {
		console.log(club?.gallery);
	}

	const interests = useMemo(() => {
		const rows = (interestsQuery.data ?? []).map((row) => ({ id: row.id, name: row.name, icon: row.icon }));
		const themes = buildInterestThemes(rows);
		return rows.map((row) => ({ ...row, theme: themes.get(row.id) ?? FALLBACK_THEME }));
	}, [interestsQuery.data]);

	// Safely cast socials from the JSONB column
	const socials = club?.socials as Record<string, string> | null;

	// Recruitment logic
	const recruitment = club?.recruitmentPeriod;
	const recruitmentText = recruitment?.allYear
		? "เปิดรับสมัครตลอดปี"
		: [formatDate(recruitment?.start), formatDate(recruitment?.end)].filter(Boolean).join(" – ") || "ไม่ระบุ";

	return (
		<div className="flex min-h-screen flex-col bg-background font-sans">
			<Navbar />
			
			<main className="body-section mx-auto w-full max-w-7xl flex-1 overflow-hidden">
				{/* Back Button */}
				<button
					type="button"
					onClick={() => router.back()}
					className="mb-4 flex items-center gap-2 self-start text-sm font-medium text-text-light-gray transition-colors hover:text-text-gray-hover hover:cursor-pointer"
				>
					<ArrowLeft className="h-5 w-5" />
					ย้อนกลับ
				</button>

				{isLoading ? (
					<div className="flex min-h-[50vh] items-center justify-center text-text-gray">กำลังโหลด...</div>
				) : error || !club ? (
					<div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
						<h1 className="text-2xl font-bold">ไม่พบชมรม</h1>
						<p className="text-text-gray">ชมรมนี้อาจถูกลบหรือไม่เปิดให้เข้าชม</p>
						<Button asChild variant="outline">
							<Link href="/clubs">กลับไปหน้าชมรม</Link>
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-10">
						
						<ClubHeader club={club} interests={interests} id={id}/>

						{/* Info Grid (Recruitment & Hours) */}
						{/* <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
							<div className="rounded-[20px] border border-stroke bg-card p-5 shadow-sm">
								<p className="text-sm font-semibold text-[#8a9198]">ช่วงรับสมัคร</p>
								<p className="mt-2 font-medium text-foreground truncate" title={recruitmentText}>{recruitmentText}</p>
							</div>
							<div className="rounded-[20px] border border-stroke bg-card p-5 shadow-sm">
								<p className="text-sm font-semibold text-[#8a9198]">เวลาเฉลี่ยต่อสัปดาห์</p>
								<p className="mt-2 font-medium text-foreground truncate" title={club.averageHoursPerWeek != null ? `${club.averageHoursPerWeek} ชั่วโมง` : "ไม่ระบุ"}>
									{club.averageHoursPerWeek != null ? `${club.averageHoursPerWeek} ชั่วโมง` : "ไม่ระบุ"}
								</p>
							</div>
						</section> */}

						<ClubAboutAndContact 
							detailedDescription={club.detailedDescription} 
							socials={socials} 
						/>

						<ClubGallery 
							clubName={club.name} 
							gallery={club.gallery} 
						/>

					</div>
				)}
			</main>
			
			<Footer />
		</div>
	);
}

// "use client";

// import { use, useMemo } from "react";
// import { ArrowLeft, Building2, Check, Globe, Instagram, Plus } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/Button";
// import { Navbar } from "@/components/ui/Navbar";
// import { Footer } from "@/components/ui/Footer";
// import { api } from "@/trpc/react";
// import { buildInterestThemes, FALLBACK_THEME } from "../_components/interest-theme";
// import { interest } from "@/server/db/interest";

// // Helper to format dates[cite: 5]
// const formatDate = (value?: Date) =>
// 	value
// 		? new Intl.DateTimeFormat("th-TH", {
// 				day: "numeric",
// 				month: "long",
// 				year: "numeric",
// 			}).format(new Date(value))
// 		: null;

// // Helper to format social links properly
// const formatSocialLink = (platform: string, handleOrUrl: string) => {
// 	if (handleOrUrl.startsWith("http")) return handleOrUrl;
	
// 	switch (platform) {
// 		case "instagram": return `https://instagram.com/${handleOrUrl.replace(/^@/, "")}`;
// 		case "facebook": return `https://facebook.com/${handleOrUrl}`;
// 		case "tiktok": return `https://tiktok.com/@${handleOrUrl.replace(/^@/, "")}`;
// 		case "line": return `https://line.me/ti/p/~${handleOrUrl}`;
// 		default: return `https://${handleOrUrl}`;
// 	}
// };

// export default function ClubDetailPage({ params }: { params: Promise<{ id: string }> }) {
// 	const { id } = use(params);
// 	const router = useRouter();
// 	const utils = api.useUtils();
//   const interestsQuery = api.interest.getAll.useQuery();
	
// 	const { data: club, isLoading, error } = api.organization.getClub.useQuery({ id });

//   if (club) {
//     console.log(club?.gallery);
//   }

//   const interests = useMemo(() => {
//       const rows = (interestsQuery.data ?? []).map((row) => ({ id: row.id, name: row.name, icon: row.icon }));
//       const themes = buildInterestThemes(rows);
//       return rows.map((row) => ({ ...row, theme: themes.get(row.id) ?? FALLBACK_THEME }));
//     }, [interestsQuery.data]);
	
// 	// Follow / Unfollow logic[cite: 5]
// 	// const { data: followedIds = [] } = api.userXOrganization.getMineFollowed.useQuery();
// 	// const followed = followedIds.includes(id);
// 	// const followMutation = api.userXOrganization.follow.useMutation({
// 	// 	onSuccess: async () => utils.userXOrganization.getMineFollowed.invalidate(),
// 	// });
// 	// const unfollowMutation = api.userXOrganization.unfollow.useMutation({
// 	// 	onSuccess: async () => utils.userXOrganization.getMineFollowed.invalidate(),
// 	// });
// 	// const followBusy = followMutation.isPending || unfollowMutation.isPending;
// 	// const followError = followMutation.error?.message ?? unfollowMutation.error?.message;

// 	// const toggleFollow = () => {
// 	// 	if (followed) {
// 	// 		unfollowMutation.mutate({ organizationId: id });
// 	// 	} else {
// 	// 		followMutation.mutate({ organizationId: id });
// 	// 	}
// 	// };

// 	// Safely cast socials from the JSONB column
// 	const socials = club?.socials as Record<string, string> | null;

// 	// Recruitment logic[cite: 5]
// 	const recruitment = club?.recruitmentPeriod;
// 	const recruitmentText = recruitment?.allYear
// 		? "เปิดรับสมัครตลอดปี"
// 		: [formatDate(recruitment?.start), formatDate(recruitment?.end)].filter(Boolean).join(" – ") || "ไม่ระบุ";

// 	return (
// 		<div className="flex min-h-screen flex-col bg-background font-sans">
// 			<Navbar />
			
// 			<main className="body-section mx-auto w-full max-w-7xl flex-1 overflow-hidden">
// 				{/* Back Button */}
// 				<button
// 					type="button"
// 					onClick={() => router.back()}
// 					className="mb-4 flex items-center gap-2 self-start text-sm font-medium text-text-light-gray transition-colors hover:text-text-gray-hover"
// 				>
// 					<ArrowLeft className="h-5 w-5" />
// 					ย้อนกลับ
// 				</button>

// 				{isLoading ? (
// 					<div className="flex min-h-[50vh] items-center justify-center text-text-gray">กำลังโหลด...</div>
// 				) : error || !club ? (
// 					<div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
// 						<h1 className="text-2xl font-bold">ไม่พบชมรม</h1>
// 						<p className="text-text-gray">ชมรมนี้อาจถูกลบหรือไม่เปิดให้เข้าชม</p>
// 						<Button asChild variant="outline">
// 							<Link href="/clubs">กลับไปหน้าชมรม</Link>
// 						</Button>
// 					</div>
// 				) : (
// 					<div className="flex flex-col gap-10">
// 						{/* Header Section */}
// 						<section className="flex min-w-0 flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-8 sm:text-left">
// 							{club.image ? (
// 								<Image
// 									src={club.image}
// 									alt={club.name}
// 									width={160}
// 									height={160}
// 									className="h-28 w-28 shrink-0 rounded-full bg-white object-cover shadow-sm sm:h-36 sm:w-36"
// 								/>
// 							) : (
// 								<div className="h-28 w-28 shrink-0 rounded-full bg-muted sm:h-36 sm:w-36" />
// 							)}

// 							<div className="flex w-full min-w-0 max-w-full flex-col items-center space-y-2 sm:items-start sm:space-y-3">
								
// 								{/* Title with ellipsis if it exceeds 2 lines & title attribute for hover */}
// 								<h1 
// 									className="line-clamp-2 w-full break-words px-4 text-3xl font-bold text-foreground sm:w-auto sm:px-0 sm:text-4xl"
// 									title={club.name}
// 								>
// 									{club.name}
// 								</h1>

// 								{/* Wrapper for responsive ordering: Mobile (Faculty -> Tags), Desktop (Tags -> Faculty) */}
// 								<div className="flex w-full flex-col gap-3 sm:flex-col-reverse sm:gap-3">
// 									{/* Faculty Placeholder with truncation */}
// 									<div className="flex w-full min-w-0 items-center justify-center gap-2 px-4 text-sm font-medium text-text-gray sm:justify-start sm:px-0 sm:text-base">
// 										<Building2 className="h-5 w-5 shrink-0" />
// 										<span 
// 											className="truncate" 
// 											title={club.facultyId ? "คณะวิศวกรรมศาสตร์" : "คณะวิศวกรรมศาสตร์"}
// 										>
// 											{club.facultyId ? "คณะวิศวกรรมศาสตร์" : "คณะวิศวกรรมศาสตร์"}
// 										</span>
// 									</div>

// 									{/* Tags - Horizontally Scrollable */}
// 									<div className="no-scrollbar flex w-full max-w-full scroll-smooth flex-nowrap justify-center sm:justify-start gap-2 overflow-x-auto px-4 pb-2 pt-1 sm:px-0">
// 										{/* <span 
// 											className="block max-w-[160px] shrink-0 truncate rounded-full bg-[#f0f5ff] px-4 py-1.5 text-xs font-semibold text-[#3b82f6] sm:text-sm"
// 											title={club.category === "CLUB" ? "วิชาการ" : club.category}
// 										>
// 											{club.category === "CLUB" ? "วิชาการ" : club.category}
// 										</span> */}
// 										{club.interests.map((interestObj) => {
// 											const prev = interests.filter(obj => obj.id === interestObj.interest.id).at(0)
//                       const  theme = prev ? prev.theme : FALLBACK_THEME
//                       return (
//                         <span 
//                           key={interestObj.interest.id} 
//                           className="block max-w-[160px] shrink-0 truncate rounded-full bg-[#fff0f5] px-4 py-1.5 text-xs font-semibold text-primary sm:text-sm"
//                           style={{ backgroundColor: theme.soft, color: theme.ink }}
//                           title={interestObj.interest.name}
//                         >
//                           {interestObj.interest.name}
//                         </span>
//                       )})}
// 									</div>
// 								</div>
//                 {/* Hidden for first official launch */}
// 								{/* Follow Button Integrated into Header */}
// 								{/* <div className="flex w-full flex-col items-center px-4 sm:items-start sm:px-0">
// 									<Button
// 										type="button"
// 										disabled={followBusy}
// 										onClick={toggleFollow}
// 										className="w-full max-w-[240px] rounded-full sm:w-auto"
// 										variant={followed ? "secondary" : "default"}
// 									>
// 										{followed ? <Check className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
// 										{followed ? "ติดตามแล้ว" : "ติดตามชมรม"}
// 									</Button>
// 									{followError && <p className="mt-2 text-sm text-red-600">{followError}</p>}
// 								</div> */}
// 							</div>
// 						</section>

// 						{/* Info Grid (Recruitment & Hours) */}
// 						{/* <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
// 							<div className="rounded-[20px] border border-stroke bg-card p-5 shadow-sm">
// 								<p className="text-sm font-semibold text-[#8a9198]">ช่วงรับสมัคร</p>
// 								<p className="mt-2 font-medium text-foreground truncate" title={recruitmentText}>{recruitmentText}</p>
// 							</div>
// 							<div className="rounded-[20px] border border-stroke bg-card p-5 shadow-sm">
// 								<p className="text-sm font-semibold text-[#8a9198]">เวลาเฉลี่ยต่อสัปดาห์</p>
// 								<p className="mt-2 font-medium text-foreground truncate" title={club.averageHoursPerWeek != null ? `${club.averageHoursPerWeek} ชั่วโมง` : "ไม่ระบุ"}>
// 									{club.averageHoursPerWeek != null ? `${club.averageHoursPerWeek} ชั่วโมง` : "ไม่ระบุ"}
// 								</p>
// 							</div>
// 						</section> */}

// 						{/* Two-Column Section: About Us & Contact Us */}
// 						<section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
							
// 							{/* About Us (Left Column) */}
// 							<div className="space-y-2 lg:col-span-2 sm:space-y-4">
// 								<h2 className="text-xl font-bold text-foreground sm:text-2xl">About Us</h2>
// 								<div className="rounded-2xl border border-stroke bg-card p-5 shadow-sm sm:p-8">
// 									<p className="whitespace-pre-wrap text-sm leading-relaxed text-text-gray sm:text-base">
// 										{club.detailedDescription || "ยังไม่มีรายละเอียดชมรม"}
// 									</p>
// 								</div>
// 							</div>

// 							{/* Contact Us (Right Column) */}
// 							<div className="space-y-2 sm:space-y-4">
// 								<h2 className="text-xl font-bold text-foreground sm:text-2xl">Contact Us</h2>
// 								<div className="flex flex-col gap-3 sm:gap-4">
// 									{socials?.instagram && (
// 										<a
// 											href={formatSocialLink("instagram", socials.instagram)}
// 											target="_blank"
// 											rel="noreferrer"
// 											title={socials.instagram}
// 											className="flex min-w-0 items-center gap-4 rounded-full border border-stroke bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-4"
// 										>
// 											<Instagram className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
// 											<span className="truncate text-sm font-medium text-foreground underline decoration-stroke underline-offset-4 sm:text-base">
// 												{socials.instagram}
// 											</span>
// 										</a>
// 									)}
									
// 									{socials?.facebook && (
// 										<a
// 											href={formatSocialLink("facebook", socials.facebook)}
// 											target="_blank"
// 											rel="noreferrer"
// 											title={socials.facebook}
// 											className="flex min-w-0 items-center gap-4 rounded-full border border-stroke bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-4"
// 										>
// 											<Globe className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
// 											<span className="truncate text-sm font-medium text-foreground underline decoration-stroke underline-offset-4 sm:text-base">
// 												{socials.facebook}
// 											</span>
// 										</a>
// 									)}

// 									{socials?.website && !socials?.facebook && (
// 										<a
// 											href={formatSocialLink("website", socials.website)}
// 											target="_blank"
// 											rel="noreferrer"
// 											title={socials.website}
// 											className="flex min-w-0 items-center gap-4 rounded-full border border-stroke bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-4"
// 										>
// 											<Globe className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
// 											<span className="truncate text-sm font-medium text-foreground underline decoration-stroke underline-offset-4 sm:text-base">
// 												{socials.website}
// 											</span>
// 										</a>
// 									)}

// 									{!socials?.instagram && !socials?.facebook && !socials?.website && (
// 										<div className="rounded-full border border-stroke bg-card px-5 py-3 text-sm text-text-gray shadow-sm sm:px-6 sm:py-4 sm:text-base">
// 											ยังไม่มีข้อมูลการติดต่อ
// 										</div>
// 									)}
// 								</div>
// 							</div>
// 						</section>

// 						{/* Gallery Section - Horizontally Scrollable */}
// 						{club.gallery && club.gallery.length > 0 && (
// 							<section className="space-y-4 pt-2 sm:space-y-6">
// 								<h2 className="text-xl font-bold text-foreground sm:text-2xl">What its like to be with us</h2>
								
// 								<div className="no-scrollbar flex snap-x snap-mandatory flex-nowrap gap-3 overflow-x-auto pb-4 sm:gap-4">
// 									{club.gallery.map((img: string, idx: number) => (
// 										<div 
// 											key={idx} 
// 											className="group relative aspect-[4/3] w-64 shrink-0 snap-center overflow-hidden rounded-xl bg-muted shadow-sm sm:w-[280px] md:w-[320px] sm:rounded-[24px]"
// 											title={`${club.name} gallery image ${idx + 1}`}
// 										>
// 											<Image
// 												src={img}
// 												alt={`${club.name} gallery image ${idx + 1}`}
// 												fill
// 												className="object-cover transition-transform duration-500 group-hover:scale-105"
// 											/>
// 										</div>
// 									))}
// 								</div>
// 							</section>
// 						)}
// 					</div>
// 				)}
// 			</main>
			
// 			<Footer />
// 		</div>
// 	);
// }