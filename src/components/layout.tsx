import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { DM_Sans } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata = {
  title: "Psikolog | Premium",
  description: "Online randevu, hizmetler ve bilgilendirme",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
<html lang="tr" className={dmSans.variable}>
      <body className="bg-white text-slate-900">
        <Nav />
        {children}
        <footer className="border-t">
          <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">
            © {new Date().getFullYear()} Psikolog • Tüm hakları saklıdır.
          </div>
        </footer>
      </body>
    </html>
  );
}
