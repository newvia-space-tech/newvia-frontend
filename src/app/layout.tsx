import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import QueryProvider from "@/components/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://joinnewvia.com"),
  title: {
    default: "NewVia - Your Wellness Journey Starts Here",
    template: "%s | NewVia",
  },
  description:
    "NewVia connects you with wellness providers for massage, yoga, and holistic health services. Book your next wellness experience today.",
  keywords: [
    "wellness",
    "massage",
    "yoga",
    "health",
    "booking",
    "spa",
    "holistic health",
  ],
  authors: [{ name: "NewVia" }],
  creator: "NewVia",
  publisher: "NewVia",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://joinnewvia.com",
    siteName: "NewVia",
    title: "NewVia - Your Wellness Journey Starts Here",
    description:
      "NewVia connects you with wellness providers for massage, yoga, and holistic health services. Book your next wellness experience today.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NewVia - Wellness Booking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "NewVia - Your Wellness Journey Starts Here",
    description:
      "NewVia connects you with wellness providers for massage, yoga, and holistic health services. Book your next wellness experience today.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get organization data from environment variables
  const organizationName = process.env.NEXT_PUBLIC_ORGANIZATION_NAME || "NewVia";
  const organizationUrl = process.env.NEXT_PUBLIC_ORGANIZATION_URL || process.env.NEXT_PUBLIC_APP_URL || "";
  const organizationLogo = process.env.NEXT_PUBLIC_ORGANIZATION_LOGO || "";

  // Build structured data JSON-LD
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organizationName,
    ...(organizationUrl && { "url": organizationUrl }),
    ...(organizationLogo && { "logo": organizationLogo }),
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          id="organization-structured-data"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
        <AuthProvider>
          <QueryProvider>
            {children}
          </QueryProvider>
        </AuthProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ""} />
    </html>
  );
}
