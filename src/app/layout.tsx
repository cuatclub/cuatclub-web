import { type Metadata } from "next";
import { IBM_Plex_Sans_Thai, Sarabun } from "next/font/google";
import "@/styles/globals.css";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: {
    default: "CUatClub - รวมชมรมและกิจกรรมจุฬาฯ ไว้ในที่เดียว",
    template: "%s | CUatClub",
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
  authors: [{ name: "CUatClub" }],
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
    <html lang="th" className={`${sarabun.variable} ${plexThai.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
