import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MatchMyVibe — Find Your Campus Vibe at DDU",
  description:
    "AI-powered hobby and community discovery for students at DDU Campus. Discover student chapters, clubs, and events that fit your vibe.",
  keywords: [
    "DDU Campus",
    "GDG Hackathon",
    "Dharmsinh Desai University",
    "campus clubs",
    "hobby matchmaker",
    "student communities",
    "MatchMyVibe",
  ],
  openGraph: {
    title: "MatchMyVibe — Find Your Campus Vibe at DDU",
    description:
      "AI-powered community discovery for DDU Campus. Tell us what you love, and we'll find your tribe.",
    type: "website",
  },
};

import { AuthProvider } from "@/context/AuthContext";
import MobileNav from "@/components/MobileNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <div
            style={{
              position: "relative",
              zIndex: 1,
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {children}
            <MobileNav />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
