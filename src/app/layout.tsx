import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { DM_Sans, Parisienne } from "next/font/google";
import type { Metadata } from "next";

/* Ana metin fontu */
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

/* İmza / handmade font */
const parisienne = Parisienne({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-parisienne",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Psikolog Eda Keklik Akalp",
  description: "Online randevu, hizmetler ve bilgilendirme",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="tr"
      className={`${dmSans.variable} ${parisienne.variable}`}
    >
      <body className="bg-[#edf3f1] text-slate-900 font-sans antialiased">
        <Nav />

        <main>{children}</main>

        <footer className="border-t border-slate-200/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>
              © {new Date().getFullYear()} Psikolog Eda Keklik Akalp • Tüm hakları saklıdır.
            </div>

            <div className="flex flex-wrap gap-4">
              <a className="hover:text-slate-900 transition-colors" href="/kvkk">
                KVKK
              </a>
              <a className="hover:text-slate-900 transition-colors" href="/gizlilik">
                Gizlilik
              </a>
              <a className="hover:text-slate-900 transition-colors" href="/cerez">
                Çerez
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
