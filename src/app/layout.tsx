import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SpaceBio Explorer",
    template: "%s | SpaceBio Explorer",
  },
  description:
    "Explore the intersection of space and biology through an interactive knowledge graph. 74,000+ relationships from NASA space biology research.",
  keywords: [
    "space biology",
    "NASA",
    "knowledge graph",
    "research",
    "Space Apps Challenge",
  ],
  authors: [{ name: "Team Techlicious" }],
  openGraph: {
    title: "SpaceBio Explorer - NASA Space Biology Knowledge Graph",
    description:
      "Explore 74,000+ interconnected relationships from space biology research. Interactive 3D visualization and Cypher query engine.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SpaceBio Explorer - NASA Space Biology Knowledge Graph",
    description:
      "Explore 74,000+ interconnected relationships from space biology research.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <a
          href="#main-content"
          className="fixed -top-20 left-4 z-[100] px-4 py-2 bg-sky-500 text-white rounded-lg transition-[top] duration-200 focus:top-4 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-gray-950"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
