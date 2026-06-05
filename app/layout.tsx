import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrometInfo — Mejni prehodi bivse Jugoslavije",
  description:
    "Cakanje na mejnih prehodih, kamere in promet za Slovenijo, Hrvasko, BiH, Srbijo, Crno goro in Severno Makedonijo.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sl">
      <body>{children}</body>
    </html>
  );
}
