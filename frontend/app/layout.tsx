import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import MacDock from "@/components/mac-dock";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Sonali Sharma | Developer & AI/ML Student", template: "%s | Sonali Sharma" },
  description: "Sonali Sharma — Computer Science student specializing in AI & ML, software development, frontend engineering and practical technology projects.",
  applicationName: "Sonali Sharma Portfolio",
  icons: { icon: "/assets/brand/sun-favicon.jpg", shortcut: "/assets/brand/sun-favicon.jpg", apple: "/assets/brand/sunflower-logo.jpg" },
  alternates: { canonical: "/" },
  openGraph: { type:"website", url:"/", title:"Sonali Sharma | Developer & AI/ML Student", description:"A personal portfolio of projects, achievements, certificates and professional work.", siteName:"Sonali Sharma Portfolio", images:["/assets/profile/sonali-portrait.jpeg"] },
  twitter: {card:"summary_large_image",title:"Sonali Sharma | Developer & AI/ML Student",description:"Projects, achievements and professional portfolio.",images:["/assets/profile/sonali-portrait.jpeg"]},
  robots: {index:true,follow:true},
};
export const viewport: Viewport = {themeColor:"#e8d5bd",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:ReactNode}) {
  return <html lang="en"><body>{children}<MacDock/></body></html>;
}
