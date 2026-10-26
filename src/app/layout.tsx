import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Ninna — sua gestação, do seu jeito", template: "%s · Ninna" },
  description:
    "Acompanhe a gravidez semana a semana, organize o pré-natal e tire dúvidas com conteúdo revisado por profissionais.",
  icons: { icon: "/ninna-icon.png", apple: "/ninna-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#f7b6cc",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
