import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { Providers } from "./providers";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: { default: "SongList", template: "%s | SongList" },
  description: "Plataforma SaaS para equipos de alabanza de iglesias",
  openGraph: {
    title: "SongList",
    description:
      "Gestiona canciones, reuniones y músicos de tu equipo de alabanza",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
    >
      <body className="text-slate-900 dark:text-slate-50 antialiased transition-colors duration-200">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              className: "text-sm font-medium",
              success: {
                iconTheme: { primary: "#1f4d8f", secondary: "white" },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
