import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans, DM_Mono, Plus_Jakarta_Sans } from "next/font/google";
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

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "STAFF GURU | Skilled work, closer to home",
  description: "A marketplace connecting skilled professionals and employers across Nigeria.",
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },

      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png" },
    ],
  },
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
      className={cn(
        "h-full",
        "antialiased",
        bricolageGrotesque.variable,
        dmSans.variable,
        dmMono.variable,
        plusJakartaSans.variable,
        "font-sans"
      )}
    >
      <body className="min-h-full flex flex-col font-sans">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
