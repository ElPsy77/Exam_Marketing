import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Marketing Exam Preparation",
  description: "Modern app for marketing student exam prep",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>
        <div className="min-h-screen bg-slate-50 md:flex">
          <Sidebar />
          <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:px-6 md:px-8 md:py-8 md:pb-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
