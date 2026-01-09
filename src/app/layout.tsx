import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import FavoritesPanel from '@/components/FavoritesPanel';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LuxSync - Client Photo Gallery",
  description: "A photo gallery platform for clients to view and download their photos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <FavoritesPanel />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}