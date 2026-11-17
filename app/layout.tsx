import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mohammed Rihab & Tafzeena — Nikkah Invitation",
  description: "Join us to celebrate the Nikkah of Mohammed Rihab and Tafzeena on December 5, 2026.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
