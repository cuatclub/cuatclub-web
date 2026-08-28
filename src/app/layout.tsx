import { type Metadata } from "next";
import { IBM_Plex_Sans_Thai, Sarabun } from "next/font/google";
import { headers } from "next/headers";
import "@/styles/globals.css";

import { auth } from "@/server/auth";
import { TRPCReactProvider } from "@/trpc/react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";

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

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <html lang="th" className={`${sarabun.variable} ${plexThai.variable}`}>
      <body>
        <Navbar
          isLoggedIn={!!session}
          userName={session?.user.name}
          userEmail={session?.user.email}
          userRole={session?.user.role}
          userImage={session?.user.image}
        />
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Footer />
      </body>
    </html>
  );
}
