import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning
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
