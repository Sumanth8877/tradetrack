import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bahnschrift = localFont({
  src: "../../public/fonts/bahnschrift.ttf",
  variable: "--font-space-grotesk",
});

const cascadiaMono = localFont({
  src: "../../public/fonts/cascadia-mono.ttf",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  description:
    "TradeTrack is a shared daily trading journal, planner, learning tracker, trade log, calendar, and analytics workspace for two traders.",
  title: "TradeTrack Workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bahnschrift.variable} ${cascadiaMono.variable} h-full bg-background text-foreground antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
