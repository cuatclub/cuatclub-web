import { type Metadata } from "next";
import { IBM_Plex_Sans_Thai, Sarabun } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import "@/styles/globals.css";

import { Toaster } from "@/components/ui";
import { env } from "@/config/env";
import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "CUAtClub | รวมชมรม และกิจกรรม ในจุฬาฯไว้ในที่เดียว",
    template: "%s | CUAtClub",
  },
  description:
    "ค้นหาชมรมและกิจกรรมในจุฬาลงกรณ์มหาวิทยาลัยที่ใช่สำหรับคุณ รวบรวมข้อมูลชมรม กิจกรรม และการรับสมัครสมาชิกจากทุกชมรมไว้ในแพลตฟอร์มเดียว",
  keywords: [
    "ชมรมจุฬา",
    "กิจกรรมจุฬา",
    "จุฬาลงกรณ์มหาวิทยาลัย",
    "Chula clubs",
    "CU club",
    "รับสมัครสมาชิกชมรม",
  ],
  authors: [{ name: "CUAtClub" }],
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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th" className={`${sarabun.variable} ${plexThai.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
        <Analytics />
        {env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
      </body>
    </html>
  );
}
