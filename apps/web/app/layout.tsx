import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Dynamically import client components with SSR disabled to prevent static generation issues
const ConsoleFilter = dynamic(() => import("@/components/ConsoleFilter").then(mod => ({ default: mod.ConsoleFilter })), {
  ssr: false,
});

const AnalyticsWrapper = dynamic(() => import("@/components/AnalyticsWrapper").then(mod => ({ default: mod.AnalyticsWrapper })), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "SwissOne - Private Banking",
  description: "Swiss private banking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <ConsoleFilter />
        {children}
        <AnalyticsWrapper />
      </body>
    </html>
  );
}

