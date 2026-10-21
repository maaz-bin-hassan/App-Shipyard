import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { assertSite } from "@/lib/content";
import { geistMono, geistSans } from "@/lib/fonts";
import { siteDescription, siteUrl } from "@/lib/site";
import { themeScript } from "@/lib/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Shipyard", template: "%s · Shipyard" },
  description: siteDescription,
  applicationName: "Shipyard",
  openGraph: { siteName: "Shipyard", type: "website", locale: "en_US" },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#0E0E0D" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  assertSite();
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="bg-bg font-sans text-text antialiased">
        <a className="skip" href="#content">
          Skip to content
        </a>
        <Header />
        <main id="content">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
