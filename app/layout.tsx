import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Telegram Bot Control Panel",
  description: "Configure and monitor your Telegram bot."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
