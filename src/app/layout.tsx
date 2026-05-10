// app/layout.tsx
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
  data-scroll-behavior="smooth"
  className={`${outfit.variable} scroll-smooth`}
>
      <body
        className="
          font-[family-name:var(--font-outfit)]
          min-h-screen
          bg-white
          text-slate-800
          overflow-x-hidden
          overflow-y-hidden
          antialiased
          fixed
          inset-0
          [&::-webkit-scrollbar]:hidden
          [-ms-overflow-style:none]
          [scrollbar-width:none]
        "
      >
        <main className="h-screen w-full overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </body>
    </html>
  );
}