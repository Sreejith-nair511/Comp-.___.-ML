import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "CrowdGuard AI | Real-Time Risk Analytics",
  description: "Advanced spatio-temporal crowd risk prediction and monitoring platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="font-outfit min-h-full bg-slate-950 text-slate-50 selection:bg-purple-500/30" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
