"use client";

import { use, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, CalendarCheck, CalendarPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { getRemainingTime } from "@/lib/getRemainingTime";
import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import Image from "next/image";
import { themeColor } from "../../../(organization)/posts/_components/PostCard";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const PostInfo = ({ params }: { params: Promise<{ id: string }> }) => {
	const { id } = use(params);
	const router = useRouter();
	const { data: session } = useSession();
	const utils = api.useUtils();
	const userId = session?.user.id ?? "";

	// fetch data from post database
	const { data: fetchedData, isLoading } = api.post.getOne.useQuery({ id });
	const [tags, setTags] = useState<string[]>([]);
	const [post, setPost] = useState<any>();
	const [calendarNotice, setCalendarNotice] = useState<string | null>(null);
	const { data: fetchedTags, isLoading: isLoadingTags } = api.interestXPost.getAllByPostId.useQuery(
		{ postId: id },
		{
			enabled: !!id,
		},
	);
	const { data: calendarItems } = api.calendarItem.getAllByUserId.useQuery(
		{ userId },
		{ enabled: !!userId },
	);

	const savedItem = useMemo(
		() => (calendarItems ?? []).find((item) => item.postId === id),
		[calendarItems, id],
	);
	const isSaved = !!savedItem;

	const createCalendarItem = api.calendarItem.create.useMutation({
		onSuccess: async () => {
			await utils.calendarItem.getAllByUserId.invalidate({ userId });
			setCalendarNotice("เพิ่มลงปฏิทินแล้ว");
		},
		onError: (err) => {
			setCalendarNotice(err.message || "ไม่สามารถเพิ่มลงปฏิทินได้");
		},
	});
	const deleteCalendarItem = api.calendarItem.delete.useMutation({
		onSuccess: async () => {
			await utils.calendarItem.getAllByUserId.invalidate({ userId });
			setCalendarNotice("ลบออกจากปฏิทินแล้ว");
		},
		onError: (err) => {
			setCalendarNotice(err.message || "ไม่สามารถลบออกจากปฏิทินได้");
		},
	});

	const calendarBusy = createCalendarItem.isPending || deleteCalendarItem.isPending;

	const handleToggleCalendar = async () => {
		if (!userId || calendarBusy) return;
		setCalendarNotice(null);
		if (isSaved && savedItem?.id) {
			await deleteCalendarItem.mutateAsync({ id: savedItem.id });
			return;
		}
		try {
			const res = await createCalendarItem.mutateAsync({ postId: id, userId });
			// Router currently returns TRPCError objects instead of throwing on some failures.
			if (res && typeof res === "object" && "code" in res) {
				setCalendarNotice("กิจกรรมนี้อยู่ในปฏิทินแล้ว หรือเพิ่มไม่สำเร็จ");
				await utils.calendarItem.getAllByUserId.invalidate({ userId });
			}
		} catch {
			setCalendarNotice("กิจกรรมนี้อยู่ในปฏิทินแล้ว หรือเพิ่มไม่สำเร็จ");
			await utils.calendarItem.getAllByUserId.invalidate({ userId });
		}
	};

	useEffect(() => {
		if (!fetchedData) {
			setPost(null);
			return;
		}

		setPost(() => {
			const temp = { ...fetchedData };
			temp.date = new Date(fetchedData.date);
			return temp;
		});
	}, [isLoading]);

	useEffect(() => {
		if (!isLoadingTags) {
			const tagList: string[] = fetchedTags?.map((tag: any) => tag.name) as string[];
			setTags(tagList);
		}
	}, [isLoadingTags]);

	return (
		<>
			<Navbar />
			{isLoading || isLoadingTags ? (
				<div className="w-full h-full flex justify-center items-center text-text-gray p-5">กำลังโหลด...</div>
			) : (
				<>
					<section className="body-section">
						<div className="h-full bg-white">
							<button
								onClick={() => router.back()}
								className="flex items-center gap-1.5 text-text-gray hover:text-primary transition-colors duration-150 hover:cursor-pointer mb-8"
							>
								<ArrowLeft className="size-6" />
								<span className="text-lg font-medium">ย้อนกลับ</span>
							</button>
							<div className="flex flex-col md:flex-row gap-12">
								<div className="flex flex-col gap-8 md:hidden">
									<div className="w-full flex justify-between items-center">
										<div className="flex gap-3 items-center">
											{/* Organization Image */}
											{post && post.userImage ? (
												<Image
													src={post.userImage}
													alt={post.name}
													width={32}
													height={32}
													className="h-8 w-8 rounded-full object-cover object-center"
												/>
											) : (
												<div className="w-8 h-8 bg-gray-400 rounded-full"></div>
											)}
											<p className="">{post?.name}</p>
										</div>
										{/* Todo: Follow Button */}
									</div>

									<div className="flex flex-col gap-3 min-w-0">
										{post && post.image ? (
											<Image
												src={post.image}
												alt={post.title}
												width={336}
												height={400}
												className="sm:hidden object-cover object-center lg:w-[336px] lg:h-[400px] bg-gray-400 rounded-[12px]"
											/>
										) : (
											<div className="sm:hidden w-[336px] h-[400px] bg-gray-400 rounded-[12px]"></div>
										)}
										<h1 className="text-black leading-none">{post?.title}</h1>

										<div className="flex flex-col gap-1">
											<p>
												<span className="font-semibold">ปิดรับสมัคร:</span>{" "}
												{new Intl.DateTimeFormat("en-GB", {
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
												}).format(post?.date ?? new Date())}
											</p>
											<p>
												<span className="font-semibold">เหลือเวลาอีก:</span>{" "}
												{getRemainingTime(post?.date ?? new Date())}
											</p>
										</div>

										<div className="flex gap-3 flex-wrap">
											{tags?.map((tag: string, idx) => (
												<div
													key={idx}
													className="px-4 py-1.5 rounded-[6px] font-semibold text-xs text-white"
													style={{ backgroundColor: themeColor[idx % themeColor.length] }}
												>
													{tag}
												</div>
											))}
										</div>
									</div>

									<div className="flex flex-col gap-3">
										<h2 className="text-black text-xl font-semibold leading-none">รายละเอียด</h2>
										<p className="text-sm w-full break-words">{post?.description}</p>
									</div>

									{/* Contact Section */}
									<div className="flex flex-col gap-3">
										<h2 className="text-black text-xl font-semibold leading-none">
											ช่องทางการติดต่อ
										</h2>
										<div className="flex flex-col gap-1.5 text-sm">
											<p>
												<span className="">Instagram:</span>{" "}
												{post?.socials.instagram ?? "ไม่มี"}
											</p>
											<p>
												<span className="">Facebook:</span> {post?.socials.facebook ?? "ไม่มี"}
											</p>
											<p>
												<span className="">Email:</span> {post?.email ?? "ไม่มี"}
											</p>
										</div>
									</div>
								</div>
								<div className="flex flex-col gap-3 items-center shrink-0">
									{/* Image */}
									{/* <div className="w-[420px] h-[500px] bg-gray-400 rounded-[12px]"></div> */}
									{post && post.image ? (
										<Image
											src={post.image}
											alt={post.title}
											width={336}
											height={400}
											className="hidden sm:block object-cover object-center lg:w-[336px] lg:h-[400px] bg-gray-400 rounded-[12px]"
										/>
									) : (
										<div className="hidden sm:block w-[336px] h-[400px] bg-gray-400 rounded-[12px]"></div>
									)}
									<Link href={post?.instaLink ?? "#"} target="_blank" className="w-full">
										<Button className="h-fit w-full text-lg">สมัครเลย</Button>
									</Link>
									<button
										type="button"
										disabled={!userId || calendarBusy}
										onClick={() => void handleToggleCalendar()}
										className={cn(
											"w-full flex items-center justify-center gap-2 p-3 border rounded-[12px] transition-colors disabled:opacity-60",
											isSaved
												? "border-primary bg-[#fff1f6] text-primary"
												: "border-stroke text-[#505050] hover:border-primary hover:text-primary",
										)}
									>
										{isSaved ? (
											<>
												<CalendarCheck className="size-5" />
												<span className="font-medium">บันทึกแล้ว</span>
											</>
										) : (
											<>
												<CalendarPlus className="size-5" />
												<span className="font-medium">
													{calendarBusy ? "กำลังบันทึก..." : "เพิ่มลงปฏิทิน"}
												</span>
											</>
										)}
									</button>
									{calendarNotice && (
										<p className="w-full text-center text-sm text-text-gray">{calendarNotice}</p>
									)}
								</div>

								<div className="md:flex flex-col gap-8 hidden min-w-0">
									<div className="w-full flex justify-between items-center">
										<div className="flex gap-3 items-center">
											{/* Organization Image */}
											{post && post.userImage ? (
												<Image
													src={post.userImage}
													alt={post.name}
													width={32}
													height={32}
													className="h-8 w-8 rounded-full object-cover object-center"
												/>
											) : (
												<div className="w-8 h-8 bg-gray-400 rounded-full"></div>
											)}
											<p className="">{post?.name}</p>
										</div>
										{/* Todo: Follow Button */}
									</div>

									<div className="flex flex-col gap-3">
										<div className="flex gap-x-2">
											<h1 className="text-black leading-none">{post?.title}</h1>
											<div className="items-center text-primary gap-x-2 flex">
												<div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
												<div className="font-semibold text-xs sm:text-sm lg:text-base">
													{post?.activityTypeName}
												</div>
											</div>
										</div>

										<div className="flex flex-col gap-1">
											<p>
												<span className="font-semibold">ปิดรับสมัคร:</span>{" "}
												{new Intl.DateTimeFormat("en-GB", {
													day: "2-digit",
													month: "2-digit",
													year: "numeric",
												}).format(post?.date ?? new Date())}
											</p>
											<p>
												<span className="font-semibold">เหลือเวลาอีก:</span>{" "}
												{getRemainingTime(post?.date ?? new Date())}
											</p>
										</div>

										<div className="flex gap-3 flex-wrap">
											{tags?.map((tag: string, idx) => (
												<div
													key={idx}
													className="px-4 py-1.5 rounded-[6px] font-semibold text-xs text-white"
													style={{ backgroundColor: themeColor[idx % themeColor.length] }}
												>
													{tag}
												</div>
											))}
										</div>
									</div>

									<div className="flex flex-col gap-3">
										<h2 className="text-black text-xl font-semibold leading-none">รายละเอียด</h2>
										<p className="text-sm w-full break-words">{post?.description}</p>
									</div>

									{/* Contact Section */}
									<div className="flex flex-col gap-3">
										<h2 className="text-black text-xl font-semibold leading-none">
											ช่องทางการติดต่อ
										</h2>
										<div className="flex flex-col gap-1.5 text-sm">
											<p>
												<span className="">
													<b>Instagram:</b>
												</span>{" "}
												{post?.socials.instagram ?? "ไม่มี"}
											</p>
											{/* <p><span className=""><b>Facebook:</b></span> {post?.socials.facebook ?? "ไม่มี"}</p> */}
											<p>
												<span className="">
													<b>Discord:</b>
												</span>{" "}
												{post?.socials.discord ?? "ไม่มี"}
											</p>
											<p>
												<span className="">
													<b>Email:</b>
												</span>{" "}
												{post?.email ?? "ไม่มี"}
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</section>
				</>
			)}
			<Footer />
		</>
	);
};

export default PostInfo;
