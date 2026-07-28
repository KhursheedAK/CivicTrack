import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicTrack - Municipal Governance Portal",
  description: "Your direct line to better municipal services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="font-sans" suppressHydrationWarning>
      <body className="antialiased bg-gray-50 text-gray-900 dark:bg-[var(--bg-chrome)] dark:text-[var(--text-primary)]">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
