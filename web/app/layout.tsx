import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { ToastContainer } from "@/components/ui/toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseOS — AI Health Intelligence & Medical Companion",
  description:
    "PulseOS transforms complex medical lab reports and daily vitals into calm, plain-language explanations with actionable next steps.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#07090D] text-[#F2F4F7] antialiased selection:bg-[#FF4D5E]/30 selection:text-white">
        <Nav />
        <main className="flex-1">{children}</main>
        <ToastContainer />
      </body>
    </html>
  );
}
