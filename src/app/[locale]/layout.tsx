import "../globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import localFont from 'next/font/local';
import { getDictionary } from "@/dictionaries";
import Hero from "@/components/home/Hero";
import { Locale } from "@/types/Locale";
import { ThemeProvider } from "@/context/ThemeContext";

const primaryFont = localFont({
  src: '../../../public/fonts/Outfit.ttf',
  display: 'swap',
  variable: '--font-outfit',
});

const secondaryFont = localFont({
  src: '../../../public/fonts/Switzer.ttf',
  display: 'swap',
  variable: '--font-switzer',
});

const tertiaryFont = localFont({
  src: '../../../public/fonts/ShadowsIntoLight-Regular.ttf',
  display: 'swap',
  variable: '--font-shadows',
});

export const metadata: Metadata = {
  title: "L'Aquarium Barcelona",
  description: "L'Aquarium Barcelona",
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const currentLocale = locale as Locale;
  const dict = await getDictionary(currentLocale);

  return (
    <html
      lang={currentLocale}
      className={`${primaryFont.variable} ${secondaryFont.variable} ${tertiaryFont.variable}  h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider>
          <Header dict={dict} currentLocale={currentLocale} />
          <Hero dict={dict} />
          {children}
          <Footer dict={dict} />
        </ThemeProvider>
      </body>
    </html >
  );
}
