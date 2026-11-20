import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const sans = localFont({
  src: [
    { path: "../../fonts/AlbertSans-300.woff", weight: "300" },
    { path: "../../fonts/AlbertSans-400.woff", weight: "400" },
    { path: "../../fonts/AlbertSans-500.woff", weight: "500" },
    { path: "../../fonts/AlbertSans-600.woff", weight: "600" },
    { path: "../../fonts/AlbertSans-700.woff", weight: "700" },
  ],
  variable: "--font-albert",
});
const mono = localFont({
  src: [
    { path: "../../fonts/RedHatMono-400.woff", weight: "400" },
    { path: "../../fonts/RedHatMono-500.woff", weight: "500" },
  ],
  variable: "--font-redhat",
});

export const metadata: Metadata = {
  title: "Owed · The SLA credit your vendor owes you, from its own status page",
  description:
    "Point Owed at a vendor's status page. It works out each service's uptime against the SLA, the credit its tier gives, and writes the claim letter, the email and a reliability card. Built with Hyper Elements.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
