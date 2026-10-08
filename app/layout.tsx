import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MediMate AI | Agentic AI Health Companion",
  description:
    "An Agentic AI health companion for medication reminders, adherence insights, and caregiver support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}