import "@/styles/globals.css";

import { type Metadata } from "next";
import { Noto_Sans, Noto_Sans_Thai } from "next/font/google";

import { AuthProvider } from "@/components/ui/context/AuthContext";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
	title: "CUAT Club",
	description: "Find your perfect club",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const notoThai = Noto_Sans_Thai({
	subsets: ["thai"],
	weight: ["100", "300", "400", "500", "600", "700", "900"],
	variable: "--font-th",
});

const noto = Noto_Sans({
	subsets: ["latin"],
	weight: ["100", "300", "400", "500", "600", "700", "900"],
	variable: "--font-en",
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`${notoThai.variable} ${noto.variable}`}>
			<body>
				<TRPCReactProvider>
					<AuthProvider>{children}</AuthProvider>
          {/* {children} */}
				</TRPCReactProvider>
			</body>
		</html>
	);
}
