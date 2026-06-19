import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import type { Metadata } from "next";
import localFont from 'next/font/local';


const primaryFont = localFont({
  src: '../../public/fonts/Outfit.ttf',
  display: 'swap',
  variable: '--font-outfit',
});

const secondaryFont = localFont({
  src: '../../public/fonts/Switzer.ttf',
  display: 'swap',
  variable: '--font-switzer',
});

const tertiaryFont = localFont({
  src: '../../public/fonts/ShadowsIntoLight-Regular.ttf',
  display: 'swap',
  variable: '--font-shadows',
});


export const metadata: Metadata = {
  title: "L'Aquarium Barcelona",
  description: "L'Aquarium Barcelona",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${primaryFont.variable} ${secondaryFont.variable} ${tertiaryFont.variable}  h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header />
        {children}
        <Footer />
      </body>
    </html >
  );
}
