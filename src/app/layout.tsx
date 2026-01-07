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
  // Base URL for absolute paths
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://joinnewvia.com";
  
  // Get organization data from environment variables
  const organizationName = process.env.NEXT_PUBLIC_ORGANIZATION_NAME || "NewVia";
  const organizationUrl = process.env.NEXT_PUBLIC_ORGANIZATION_URL || baseUrl;
  // Logo must be an absolute URL for Google
  const organizationLogo = process.env.NEXT_PUBLIC_ORGANIZATION_LOGO || `${baseUrl}/public/icon.svg`;

  // Build structured data JSON-LD for Google Search
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": organizationName,
    "url": organizationUrl,
    "logo": organizationLogo,
    "description": "NewVia connects you with wellness providers for massage, yoga, and holistic health services. Book your next wellness experience today.",
    "sameAs": [
      // Add your social media URLs here when available
      // "https://www.facebook.com/newvia",
      // "https://www.instagram.com/newvia",
      // "https://www.linkedin.com/company/newvia",
    ].filter(Boolean),
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
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
