import { globalFont } from "@/libs/font";
import "@/styles/globals.css";
import { Analytics } from "@vercel/analytics/next";
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
      className={`${globalFont.className} antialiased`}
    >
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
