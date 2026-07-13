import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://driftnblooms.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Drift & Bloom | Curated Calming Packages",
    template: "%s | Drift & Bloom",
  },
  description:
    "Premium plant, candle, and Betta fish packages designed to create calming spaces for every mood and season of life.",
  applicationName: "Drift & Bloom",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Drift & Bloom",
    title: "Drift & Bloom | Curated Calming Packages",
    description:
      "Build a calming space with curated plants, candles, fish bowls, and meaningful collection cards.",
    images: [
      {
        url: "/assets/homepage.jpeg",
        width: 1200,
        height: 630,
        alt: "Drift & Bloom calming package arrangement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Drift & Bloom | Curated Calming Packages",
    description:
      "Premium plant, candle, and Betta fish packages designed to create calming spaces.",
    images: ["/assets/homepage.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/logo.jpeg",
    shortcut: "/logo.jpeg",
    apple: "/logo.jpeg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF7F0",
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Drift & Bloom",
  url: siteUrl,
  logo: `${siteUrl}/assets/logo.jpeg`,
};

const storeJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Drift & Bloom",
  url: siteUrl,
  image: `${siteUrl}/assets/homepage.jpeg`,
  description:
    "Curated calming packages with plants, candles, Betta fish bowls, and collection cards.",
  priceRange: "LE",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cormorant.variable}`}>
      <body className="font-sans">
        <Script
          id="drift-bloom-organization-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <Script
          id="drift-bloom-store-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeJsonLd) }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
