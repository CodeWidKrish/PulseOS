import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07090D",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://pulseos.health"),
  title: "PulseOS — Your health, in plain language.",
  description:
    "PulseOS transforms complex medical lab reports and daily vitals into calm, plain-language explanations with actionable next steps.",
  keywords: [
    "health AI",
    "lab report explainer",
    "blood test translation",
    "vitals tracker",
    "medical companion",
    "doctor booking",
  ],
  authors: [{ name: "PulseOS Team" }],
  openGraph: {
    title: "PulseOS — Your health, in plain language.",
    description:
      "PulseOS transforms complex medical lab reports and daily vitals into calm, plain-language explanations with actionable next steps.",
    type: "website",
    locale: "en_US",
    siteName: "PulseOS",
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseOS — Your health, in plain language.",
    description:
      "PulseOS transforms complex medical lab reports and daily vitals into calm, plain-language explanations with actionable next steps.",
  },
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
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
