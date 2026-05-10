import type { Metadata } from "next";
import { Outfit } from "next/font/google"; 
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Traveloop",
  description: "AI powered travel planning platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} scroll-smooth`}
    >
      <body
        className="
          font-[family-name:var(--font-outfit)]
          min-h-screen
          bg-black
          text-white
          overflow-x-hidden
          antialiased
        "
      >
        <div className="fixed inset-0 -z-50">
          <div
            className="
              absolute
              inset-0
              bg-gradient-to-br
              from-emerald-950
              via-black
              to-black
            "
          />

          <div
            className="
              absolute
              top-[-120px]
              left-[-120px]
              w-[350px]
              h-[350px]
              rounded-full
              bg-green-500/20
              blur-3xl
            "
          />
          <div
            className="
              absolute
              bottom-[-120px]
              right-[-120px]
              w-[400px]
              h-[400px]
              rounded-full
              bg-emerald-400/10
              blur-3xl
            "
          />
        </div>

        <main>{children}</main>
      </body>
    </html>
  );
}