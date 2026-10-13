import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, DM_Mono, Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "STAFF GURU | Skilled work, closer to home",
  description: "A demo marketplace connecting skilled professionals and employers across Nigeria.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Staff Guru",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#008751",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-NG"
      className={cn("h-full", "antialiased", bricolageGrotesque.variable, dmSans.variable, dmMono.variable, inter.variable, "font-sans")}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
