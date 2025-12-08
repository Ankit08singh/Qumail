// pages/_app.tsx
import { SessionProvider } from "next-auth/react";
import type { AppProps } from "next/app";
import "@/styles/globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { Space_Grotesk, DM_Sans, Space_Mono } from "next/font/google";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-heading",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
  variable: "--font-body",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-mono",
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <div
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${spaceMono.variable} font-sans`}
      >
        <ThemeProvider>
          <Component {...pageProps} />
        </ThemeProvider>
      </div>
    </SessionProvider>
  );
}
