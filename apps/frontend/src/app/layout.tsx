import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
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
  title: "TSEC Express",
  description: "Progressive Web App for TSEC Express",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TSEC Express",
  },
};

export const viewport: Viewport = {
  themeColor: "#df244d",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden bg-white text-slate-900 flex flex-col">
        <AuthProvider>
          <SocketProvider>
            {children}
            <Toaster position="top-center" toastOptions={{ 
              style: { background: '#ffffff', color: '#1f2937', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } 
            }} />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
