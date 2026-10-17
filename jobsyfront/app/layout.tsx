import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Geist, Geist_Mono, Tektur } from "next/font/google";
import "./globals.css";
import 'flowbite';
import { PrimeReactProvider } from "primereact/api";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Polices du Système (refonte gamifiée) : titres et chiffres de rang, puis texte courant très lisible
const tektur = Tektur({
  variable: "--font-tektur",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  // Next.js n'a pas les métriques de cette police pour ajuster la police de secours : on garde la pile de --font-lisible
  adjustFontFallback: false,
});

export const metadata: Metadata = {
  title: "Jobsy",
  description: "",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${tektur.variable} ${atkinson.variable} antialiased`} suppressHydrationWarning
      >
        <PrimeReactProvider>
          <Toaster
                position="top-right"
                toastOptions={{
                duration: 6000,
                style: { borderRadius: '10px' },
                }}
            />
          {children}
        </PrimeReactProvider>
      </body>
    </html>
  );
}
