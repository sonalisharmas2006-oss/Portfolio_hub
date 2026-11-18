import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import MacDock from "@/components/mac-dock";

const siteUrl = "https://portfolio-hub-psi-beige.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Sonali Sharma | Software Developer, AI & ML Student Portfolio",
    template: "%s | Sonali Sharma",
  },
  description:
    "Explore Sonali Sharma's portfolio — a Computer Science (AI & ML) student and software developer from Kolkata, India. Discover projects in web development, cybersecurity, blockchain, AI/ML and computer vision, plus achievements, certificates and technical skills.",
  applicationName: "Sonali Sharma Portfolio",
  authors: [{ name: "Sonali Sharma", url: siteUrl }],
  creator: "Sonali Sharma",
  publisher: "Sonali Sharma",
  keywords: [
    "Sonali Sharma",
    "Sonali Sharma portfolio",
    "Sonali Sharma developer",
    "software developer portfolio",
    "AI ML student Kolkata",
    "Computer Science student",
    "web development projects",
    "cybersecurity project",
    "blockchain project",
    "Code Nexus",
    "AutoEscrow",
    "H2Sentry",
    "Smart Urban Flood Mitigation",
    "Narula Institute of Technology",
  ],
  icons: {
    icon: "/assets/brand/sun-favicon.jpg",
    shortcut: "/assets/brand/sun-favicon.jpg",
    apple: "/assets/brand/sunflower-logo.jpg",
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Sonali Sharma | Software Developer & AI/ML Student",
    description:
      "Personal portfolio of Sonali Sharma from Kolkata, India — explore software projects, AI/ML experiments, cybersecurity, blockchain, achievements and certificates.",
    siteName: "Sonali Sharma Portfolio",
    locale: "en_IN",
    images: [
      {
        url: "/assets/profile/sonali-portrait.jpeg",
        alt: "Sonali Sharma portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sonali Sharma | Software Developer & AI/ML Student",
    description:
      "Explore Sonali Sharma's software development, AI/ML and cybersecurity projects, achievements and certificates.",
    images: ["/assets/profile/sonali-portrait.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#e8d5bd",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <MacDock />
      </body>
    </html>
  );
}
