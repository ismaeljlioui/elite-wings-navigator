import type { Metadata } from "next";
import "./coss.css";
import "./globals.css";
import "./dashboard.css";
import "./obsidian-shell.css";
import "./tilt-cards.css";
import "./refinements.css";
import "./glass-dock.css";
import "./seek.css";
import "./page-frame.css";
import "./select.css";
import "./shortlist.css";
import "./navigator-identity.css";
import "./compare.css";
import "./range-scrubber.css";
import "./price-bars.css";
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
