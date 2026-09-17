import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderStatusBar from "@/components/OrderStatusBar";
import SiteChrome from "@/components/SiteChrome";
import { CartProvider } from "@/lib/cart-context";
import { OrderProvider } from "@/lib/order-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Mela | Food Mela & Anjum Kabab Ghor",
  description:
    "Food Mela — home of Food Mela and Anjum Kabab Ghor. Order online coming soon.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-cream text-ink">
        <CartProvider>
          <OrderProvider>
            <SiteChrome navbar={<Navbar />} footer={<Footer />} overlay={<OrderStatusBar />}>
              {children}
            </SiteChrome>
          </OrderProvider>
        </CartProvider>
      </body>
    </html>
  );
}
