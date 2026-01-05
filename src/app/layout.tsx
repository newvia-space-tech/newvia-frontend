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
  title: "NewVia",
  description: "NewVia",
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
