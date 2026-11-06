import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Jet Navigator — Elite Wings",
  description:
    "Discover your next aircraft. Explore and compare business jet performance, cabins, and specifications with Elite Wings.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
