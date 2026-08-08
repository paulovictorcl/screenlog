import type { Metadata, Viewport } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
});

export const viewport: Viewport = {
  themeColor: "#121316",
};

export const metadata: Metadata = {
  title: "ScreenLog",
  description: "Acompanhe e compare seus filmes e séries favoritos.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ScreenLog",
  },
  icons: {
    icon: "/simbolo.png",
    apple: "/simbolo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={spaceGrotesk.className}>
        {children}
      </body>
    </html>
  );
}
