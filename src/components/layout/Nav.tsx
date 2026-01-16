"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/hakkinda", label: "Hakkımızda" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/testler", label: "Testler" },
  { href: "/randevu", label: "Randevu Al", cta: true },
  { href: "/iletisim", label: "İletişim" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-[#edf3f1]/75 backdrop-blur supports-[backdrop-filter]:bg-[#edf3f1]/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="select-none leading-tight text-slate-900">
          <span className="font-signature block sm:inline text-2xl">
            Psikolog Eda Keklik
          </span>
          <span className="font-signature block sm:inline sm:ml-2 text-2xl">
            Akalp
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-2 md:flex">
          {links
            .filter((l) => l.href !== "/")
            .map((l) => {
              const isCta = !!l.cta;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    isCta
                      ? "ml-2 rounded-full border border-slate-300/60 bg-white/60 px-4 py-2 text-sm text-slate-900 shadow-sm transition hover:bg-white/80 hover:shadow"
                      : "rounded-full px-3 py-2 text-sm text-slate-700 transition hover:bg-white/50 hover:text-slate-900"
                  }
                >
                  {l.label}
                </Link>
              );
            })}
        </nav>

        

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center justify-center rounded-full border border-slate-300/60 bg-white/50 p-2 text-slate-800 shadow-sm transition hover:bg-white/80 hover:shadow md:hidden"
          aria-label="Menüyü aç"
          aria-expanded={open}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <div className="fixed right-3 top-3 z-[60] w-[min(92vw,420px)] overflow-hidden rounded-3xl border border-slate-200/70 bg-white/80 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between px-5 py-4">
              <div className="leading-tight text-slate-900">
                <div className="text-xs text-slate-600">Menü</div>
                <div className="font-signature text-2xl">Psikolog</div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-slate-300/60 bg-white/60 p-2 text-slate-800 shadow-sm transition hover:bg-white/90 hover:shadow"
                aria-label="Kapat"
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M7 7l10 10M17 7L7 17"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="px-3 pb-4">
              <div className="rounded-2xl border border-slate-200/70 bg-white/60 p-2">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "flex items-center justify-between rounded-xl px-4 py-3 text-sm transition",
                      l.cta
                        ? "mt-1 bg-slate-900 text-white hover:bg-slate-800"
                        : "text-slate-800 hover:bg-white/70",
                    ].join(" ")}
                  >
                    <span className="font-medium">{l.label}</span>
                    <span
                      className={[
                        "text-xs",
                        l.cta ? "text-white/80" : "text-slate-400",
                      ].join(" ")}
                    >
                      →
                    </span>
                  </Link>
                ))}
              </div>

              <div className="mt-3 grid gap-2">
                <Link
                  href="/giris"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-300/70 bg-white/70 px-4 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-white/90 hover:shadow"
                >
                  Giriş
                </Link>

                <div className="rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 text-xs text-slate-600">
                  Seanslar gizlilik ve etik ilkeler kapsamında yürütülür.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
