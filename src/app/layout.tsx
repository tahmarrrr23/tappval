import { bodyFont, monoFont } from "@/lib/font";
import "@/styles/globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "tappval",
  description: "Playground for Tappy",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="lofi"
      className={`${bodyFont.variable} ${monoFont.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
