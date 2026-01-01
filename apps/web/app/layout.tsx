import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Dynamically import ClientLayoutComponents with no SSR to prevent static generation issues
// This ensures it's only loaded on the client side
const ClientLayoutComponents = dynamic(
  () => import("@/components/ClientLayoutComponents").then(mod => ({ default: mod.ClientLayoutComponents })),
  { ssr: false }
);

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
        <ClientLayoutComponents />
        {children}
      </body>
    </html>
  );
}

