import "@/styles/globals.css";

import { type Metadata } from "next";
import { IBM_Plex_Sans_Thai, Noto_Sans } from "next/font/google";

import { AuthProvider } from "@/components/ui/context/AuthContext";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "CUAT Club",
	description: "Find your perfect club",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const plexThai = IBM_Plex_Sans_Thai({
	subsets: ["thai"],
	weight: ["100", "200", "300", "400", "500", "600", "700"],
	variable: "--font-th",
});

const noto = Noto_Sans({
	subsets: ["latin"],
	weight: ["100", "300", "400", "500", "600", "700", "900"],
	variable: "--font-en",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${plexThai.variable} ${noto.variable}`}>
			<body>
				<TRPCReactProvider>
					<AuthProvider>{children}</AuthProvider>
          {/* {children} */}
				</TRPCReactProvider>
			</body>
		</html>
	);
}
