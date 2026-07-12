import type { Metadata } from "next";
import "./globals.css";
import { GuestSession } from "@/components/auth/GuestSession";
import { ThemeController } from "@/components/theme/ThemeController";

export const metadata: Metadata = {
  title: "CrownScore | Personal hair progress",
  description: "Guided scalp check-ins and relative progress tracking based on your own baseline.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-background text-foreground"><ThemeController /><GuestSession />{children}</body>
    </html>
  );
}
