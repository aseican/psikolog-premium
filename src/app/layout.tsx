// src/app/layout.tsx
import "./globals.css";
import { Nav } from "@/components/layout/Nav";
import { DM_Sans, Parisienne } from "next/font/google";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

/** Admin’de değişince hızlı yansısın (cache’e takılmasın). */
export const revalidate = 0;
export const dynamic = "force-dynamic";

const DEFAULT_BG = "#edf3f1";
const DEFAULT_NAV_BG = "#edf3f1";
const DEFAULT_PRIMARY = "#0f766e";
const DEFAULT_PRIMARY_RGB = "15 118 110";

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

type ThemeData = {
  // geriye dönük
  bg?: string;

  // yeni ayrım
  siteBg?: string;
  navBg?: string;

  primary?: string; // tercihen hex (#0f766e)
};

type FooterLink = { label: string; href: string };
type FooterData = {
  copyright?: string; // "© {year} ..." gibi
  links?: FooterLink[];
};

function normalizeHex(hex?: string): string | null {
  if (!hex) return null;
  const raw = hex.trim().replace("#", "");
  if (!raw) return null;

  const normalized =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;

  if (normalized.length !== 6) return null;
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return null;

  return `#${normalized.toLowerCase()}`;
}

function hexToRgbTriplet(hex?: string): string | null {
  const normalized = normalizeHex(hex);
  if (!normalized) return null;

  const h = normalized.slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);

  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return `${r} ${g} ${b}`;
}

async function readThemeFromDB(): Promise<ThemeData | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from("cms_blocks")
      .select("data")
      .eq("key", "theme")
      .single();

    if (error) return null;

    const theme = (data?.data as ThemeData) ?? null;
    return theme;
  } catch {
    return null;
  }
}

async function readFooterFromDB(): Promise<FooterData | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return null;

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabase
      .from("cms_blocks")
      .select("data")
      .eq("key", "footer")
      .single();

    if (error) return null;

    const footer = (data?.data as FooterData) ?? null;
    return footer;
  } catch {
    return null;
  }
}

function withYearTemplate(input: string, year: number) {
  return input.replaceAll("{year}", String(year));
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, footer] = await Promise.all([readThemeFromDB(), readFooterFromDB()]);

  // geriye dönük: theme.bg varsa fallback olarak kullan
  const legacyBg = theme?.bg?.trim() ? theme.bg.trim() : "";

  const siteBg = theme?.siteBg?.trim()
    ? theme.siteBg.trim()
    : legacyBg || DEFAULT_BG;

  const navBg = theme?.navBg?.trim()
    ? theme.navBg.trim()
    : legacyBg || DEFAULT_NAV_BG;

  const sitePrimaryRaw = theme?.primary?.trim()
    ? theme.primary.trim()
    : DEFAULT_PRIMARY;

  const sitePrimaryHex = normalizeHex(sitePrimaryRaw) || DEFAULT_PRIMARY;
  const sitePrimaryRgb = hexToRgbTriplet(sitePrimaryRaw) || DEFAULT_PRIMARY_RGB;

  const year = new Date().getFullYear();

  const defaultFooter: Required<FooterData> = {
    copyright: `© {year} Psikolog Eda Keklik Akalp • Tüm hakları saklıdır.`,
    links: [
      { label: "KVKK", href: "/kvkk" },
      { label: "Gizlilik", href: "/gizlilik" },
      { label: "Çerez", href: "/cerez" },
    ],
  };

  const footerData: Required<FooterData> = {
    copyright: footer?.copyright?.trim()
      ? footer.copyright.trim()
      : defaultFooter.copyright,
    links:
      Array.isArray(footer?.links) && footer!.links!.length > 0
        ? footer!.links!.filter((l) => l?.label && l?.href)
        : defaultFooter.links,
  };

  return (
    <html
      lang="tr"
      className={`${dmSans.variable} ${parisienne.variable}`}
      style={
        {
          "--site-bg": siteBg,
          "--nav-bg": navBg,
          "--site-primary": sitePrimaryHex,
          "--site-primary-rgb": sitePrimaryRgb,
        } as React.CSSProperties
      }
    >
      <body className="bg-[var(--site-bg)] text-slate-900 font-sans antialiased">
        <Nav />

        <main>{children}</main>

        <footer className="border-t border-slate-200/60">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
            <div>{withYearTemplate(footerData.copyright, year)}</div>

            <div className="flex flex-wrap gap-4">
              {footerData.links.map((l) => (
                <a
                  key={`${l.href}-${l.label}`}
                  className="hover:text-slate-900 transition-colors"
                  href={l.href}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
