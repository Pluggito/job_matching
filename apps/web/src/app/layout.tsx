import type { Metadata } from "next";
import { Manrope, Space_Grotesk, DM_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";



const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STAFF GURU | Skilled work, closer to home",
  description: "A demo marketplace connecting skilled professionals and employers across Nigeria.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-NG"
      className={cn("h-full", "antialiased", manrope.variable, spaceGrotesk.variable, dmMono.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
