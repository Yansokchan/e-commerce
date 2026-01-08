import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
  title: "Socheath Store - Shop smarter",
  description: "Socheath Store - Shop smarter",
  keywords: ["Socheath Store", "Shop smarter", "Online Shopping"],
  openGraph: {
    title: "Socheath Store - Shop smarter",
    description: "Socheath Store - Shop smarter",
    type: "website",
    locale: "en_US",
    siteName: "Socheath Store",
    images: [
      {
        url: "https://example.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Socheath Store - Shop smarter",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        <StoreProvider>
          <AuthProvider>
            <Toaster />
            {children}
          </AuthProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
