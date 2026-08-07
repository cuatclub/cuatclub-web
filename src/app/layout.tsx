import "@/styles/globals.css";

import { type Metadata } from "next";
import { IBM_Plex_Sans_Thai, Sarabun } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "CUAT Club",
	description: "Find your perfect club",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const sarabun = Sarabun({
	subsets: ["thai"],
	weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
	variable: "--font-th-sarabun",
});

const plexThai = IBM_Plex_Sans_Thai({
	subsets: ["thai"],
	weight: ["100", "200", "300", "400", "500", "600", "700"],
	variable: "--font-ibm-plex",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${sarabun.variable} ${plexThai.variable} ${noto.variable}`}>
			<body>
				<TRPCReactProvider>
					{children}
				</TRPCReactProvider>
			</body>
		</html>
	);
}
