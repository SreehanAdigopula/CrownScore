import type { Metadata } from "next";
import { Calistoga, Figtree, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AccountBootstrap } from "@/components/auth/AccountBootstrap";
import { ThemeController } from "@/components/theme/ThemeController";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const calistoga = Calistoga({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-calistoga",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
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
      className={`h-full antialiased ${figtree.variable} ${calistoga.variable} ${jetbrainsMono.variable}`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <ThemeController />
        <AccountBootstrap />
        {children}
      </body>
    </html>
  );
}
