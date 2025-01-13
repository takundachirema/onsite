/* eslint-disable @next/next/no-page-custom-font */
import "$/src/styles/globals.css";
import { type Metadata } from "next";
import { siteConfig, type SiteConfig } from "$/src/config/site";
import { fontSans } from "$/src/config/fonts";
import clsx from "clsx";

import { Providers } from "./providers";
import { Navbar } from "$/src/components/Navbar";
import { Footer } from "../components/Footer";

const config: SiteConfig = siteConfig;

export const metadata: Metadata = {
  title: {
    default: config.name,
    template: `%s - ${config.name}`,
  },
  description: siteConfig.description,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={
          "font-outfit min-h-screen overflow-clip bg-background antialiased"
        }
      >
        <Providers
          themeProps={{ children, attribute: "class", defaultTheme: "dark" }}
        >
          <Navbar />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
