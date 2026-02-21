import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ken Bett — Full-Stack Engineer",
  description:
    "Senior full-stack engineer based in Nairobi. 6+ years building high-performance products, open-source libraries, and developer tools.",
  keywords: [
    "Ken Bett",
    "Full-Stack Engineer",
    "Nairobi",
    "React",
    "TypeScript",
    "Next.js",
    "Software Engineer",
  ],
  authors: [{ name: "Ken Bett", url: "mailto:kenatohat@gmail.com" }],
  openGraph: {
    title: "Ken Bett — Full-Stack Engineer",
    description:
      "Senior full-stack engineer based in Nairobi. 6+ years building high-performance products.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
