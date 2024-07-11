import type { Metadata } from "next";
import ConvexClientProvider from "./ConvexClientProvider";

import { Inter } from "next/font/google";

import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "./header";
import { Footer } from "./footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "File Drive",
  description: "The easiest way to upload and share files with your company",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  return (
    <html lang="en">
      <body className={inter.className}>
        <ConvexClientProvider>
          <header>
            <Header />
          </header>
          <main>
            {children}
          </main>
          <footer>
            <Footer />
          </footer>
          <Toaster />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
