"use client";

import { Instagram, Globe, Facebook } from "lucide-react";

interface ClubAboutAndContactProps {
	detailedDescription?: string | null;
	socials?: Record<string, string> | null;
}

// Custom Icon for TikTok
const TikTokIcon = ({ className }: { className?: string }) => (
	<svg viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
	</svg>
);

// Custom Icon for Discord
const DiscordIcon = ({ className }: { className?: string }) => (
	<svg viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
	</svg>
);

// Custom Icon for Line
const LineIcon = ({ className }: { className?: string }) => (
	<svg viewBox="0 0 24 24" fill="currentColor" className={className}>
		<path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596a.617.617 0 01-.19.03.643.643 0 01-.51-.255l-2.443-3.317v2.926c0 .344-.279.629-.626.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595a.652.652 0 01.192-.03c.2 0 .385.107.51.253l2.443 3.317V8.108c0-.345.279-.63.626-.63.347 0 .626.285.626.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.345.28-.63.626-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .626.285.626.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
	</svg>
);

const formatSocialLink = (platform: string, handleOrUrl: string) => {
	if (handleOrUrl.startsWith("http")) return handleOrUrl;
	
	switch (platform) {
		case "instagram": return `https://instagram.com/${handleOrUrl.replace(/^@/, "")}`;
		case "facebook": return `https://facebook.com/${handleOrUrl}`;
		case "tiktok": return `https://tiktok.com/@${handleOrUrl.replace(/^@/, "")}`;
		case "discord": return `https://discord.gg/${handleOrUrl}`;
		case "line": return `https://line.me/ti/p/~${handleOrUrl}`;
		default: return `https://${handleOrUrl}`;
	}
};

export function ClubAboutAndContact({ detailedDescription, socials }: ClubAboutAndContactProps) {
	return (
		<section className="grid grid-cols-1 gap-8 lg:grid-cols-3">
			{/* About Us (Left Column) - Added flex flex-col to parent */}
			<div className="flex flex-col space-y-2 lg:col-span-2 sm:space-y-4">
				<h2 className="text-xl font-bold text-foreground sm:text-2xl">About Us</h2>
				{/* Added flex-grow so this card fills the remaining height */}
				<div className="flex-grow rounded-2xl border border-stroke bg-card p-5 shadow-sm sm:p-8">
					<p className="whitespace-pre-wrap text-sm leading-relaxed text-text-gray sm:text-base">
						{detailedDescription || "ยังไม่มีรายละเอียดชมรม"}
					</p>
				</div>
			</div>

			{/* Contact Us (Right Column) */}
			<div className="space-y-2 sm:space-y-4">
				<h2 className="text-xl font-bold text-foreground sm:text-2xl">Contact Us</h2>
				
				<div className="flex flex-col w-full sm:max-w-full sm:w-fit lg:w-full gap-3 sm:gap-4">
					
					{socials?.instagram && (
						<a
							href={formatSocialLink("instagram", socials.instagram)}
							target="_blank"
							rel="noreferrer"
							title={socials.instagram}
							className="flex w-full min-w-0 items-center gap-4 rounded-full border border-stroke bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-4"
						>
							<Instagram className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
							<span className="truncate text-sm font-medium text-foreground underline decoration-stroke underline-offset-4 sm:text-base">
								{socials.instagram}
							</span>
						</a>
					)}
					
					{socials?.facebook && (
						<a
							href={formatSocialLink("facebook", socials.facebook)}
							target="_blank"
							rel="noreferrer"
							title={socials.facebook}
							className="flex w-full min-w-0 items-center gap-4 rounded-full border border-stroke bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-4"
						>
							<Facebook className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
							<span className="truncate text-sm font-medium text-foreground underline decoration-stroke underline-offset-4 sm:text-base">
								{socials.facebook}
							</span>
						</a>
					)}

					{socials?.tiktok && (
						<a
							href={formatSocialLink("tiktok", socials.tiktok)}
							target="_blank"
							rel="noreferrer"
							title={socials.tiktok}
							className="flex w-full min-w-0 items-center gap-4 rounded-full border border-stroke bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-4"
						>
							<TikTokIcon className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
							<span className="truncate text-sm font-medium text-foreground underline decoration-stroke underline-offset-4 sm:text-base">
								{socials.tiktok}
							</span>
						</a>
					)}

					{socials?.discord && (
						<a
							href={formatSocialLink("discord", socials.discord)}
							target="_blank"
							rel="noreferrer"
							title={socials.discord}
							className="flex w-full min-w-0 items-center gap-4 rounded-full border border-stroke bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-4"
						>
							<DiscordIcon className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
							<span className="truncate text-sm font-medium text-foreground underline decoration-stroke underline-offset-4 sm:text-base">
								{socials.discord}
							</span>
						</a>
					)}

					{socials?.line && (
						<a
							href={formatSocialLink("line", socials.line)}
							target="_blank"
							rel="noreferrer"
							title={socials.line}
							className="flex w-full min-w-0 items-center gap-4 rounded-full border border-stroke bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-4"
						>
							<LineIcon className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
							<span className="truncate text-sm font-medium text-foreground underline decoration-stroke underline-offset-4 sm:text-base">
								{socials.line}
							</span>
						</a>
					)}

					{socials?.website && (
						<a
							href={formatSocialLink("website", socials.website)}
							target="_blank"
							rel="noreferrer"
							title={socials.website}
							className="flex w-full min-w-0 items-center gap-4 rounded-full border border-stroke bg-card px-5 py-3 shadow-sm transition-shadow hover:shadow-md sm:px-6 sm:py-4"
						>
							<Globe className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
							<span className="truncate text-sm font-medium text-foreground underline decoration-stroke underline-offset-4 sm:text-base">
								{socials.website}
							</span>
						</a>
					)}

					{/* Fallback condition */}
					{!socials?.instagram &&
						!socials?.facebook &&
						!socials?.website &&
						!socials?.tiktok &&
						!socials?.discord &&
						!socials?.line && (
						<div className="flex w-full min-w-0 rounded-full border border-stroke bg-card px-5 py-3 text-sm text-text-gray shadow-sm sm:px-6 sm:py-4 sm:text-base">
							ยังไม่มีข้อมูลการติดต่อ
						</div>
					)}
				</div>
			</div>
		</section>
	);
}