import type { Metadata } from "next";
import AppProviders from "@/providers/AppProviders";
import "../shared/styles/globals.css";

export const metadata: Metadata = {
  title: "Checkbook App",
  description: "Manage your checkbook with ease",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
