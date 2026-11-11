import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { ToastContainer } from "@/components/ui/toast";

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
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
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
    images: [
      {
        url: "/media/og-pulseos.png",
        width: 1200,
        height: 630,
        alt: "PulseOS — Your health, in plain language.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PulseOS — Your health, in plain language.",
    description:
      "PulseOS transforms complex medical lab reports and daily vitals into calm, plain-language explanations with actionable next steps.",
    images: ["/media/og-pulseos.png"],
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
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preload"
          as="image"
          href="/media/blood-flow-poster.jpg"
          fetchPriority="high"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-page)] antialiased relative">
        {/* Subtle noise/grain depth overlay at 3% opacity */}
        <div
          className="fixed inset-0 pointer-events-none noise-grain-overlay z-50 opacity-[0.03]"
          aria-hidden="true"
        />

        <ThemeProvider>
          <div className="flex-1 flex flex-col">{children}</div>
          <ToastContainer />
        </ThemeProvider>
      </body>
    </html>
  );
}
