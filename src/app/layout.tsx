import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Sora } from "next/font/google";
import "./globals.css";
import { AccountBootstrap } from "@/components/auth/AccountBootstrap";
import { ThemeController } from "@/components/theme/ThemeController";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-plex",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CrownScore | Visible hair progress, carefully scored",
  description:
    "Guided photo check-ins that score visible hair and scalp concerns on-device. Not a diagnosis — a consistent progress tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`h-full antialiased ${sora.variable} ${fraunces.variable} ${ibmPlexMono.variable}`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <ThemeController />
        <AccountBootstrap />
        {children}
      </body>
    </html>
  );
}
