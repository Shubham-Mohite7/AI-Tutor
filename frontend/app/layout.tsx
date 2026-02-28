import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AITutor — Learn Smarter, Not Harder",
  description:
    "Master any subject with an AI tutor that explains concepts clearly and tests you with a custom mock test.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.png", apple: "/icon-192.png" },
};

export const viewport: Viewport = {
  themeColor: "#5AB2FF",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=Fraunces:wght@700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-gradient-to-b from-brand-50 via-brand-100 to-brand-200 font-sans antialiased">{children}</body>
    </html>
  );
}
