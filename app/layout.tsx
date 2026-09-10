import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const satoshi = localFont({
  src: "./fonts/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
});

const chillax = localFont({
  src: "./fonts/Chillax-Variable.woff2",
  variable: "--font-chillax",
  weight: "200 700",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Virtual Staging",
    template: "%s · Virtual Staging",
  },
  description:
    "Virtual staging con IA para pequeñas inmobiliarias: decora tus fotografías de inmuebles vacíos.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${satoshi.variable} ${chillax.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
