import Link from "next/link";
import { site } from "@/lib/mock/site";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[32px] border bg-white">
      {/* soft gradient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-slate-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-slate-100 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-slate-50/60" />
      </div>

      <div className="relative grid gap-10 p-8 md:grid-cols-[1.15fr_0.85fr] md:p-12">
        {/* left */}
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs text-slate-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Online seanslar açık
          </div>

          <p className="mt-4 text-sm font-medium text-slate-600">{site.brand}</p>

          <p className="mt-4 text-slate-700 md:text-lg">{site.heroLead}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/randevu"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md"
            >
              Randevu Al
            </Link>

            <Link
              href="/hizmetler"
              className="rounded-2xl border bg-white/70 px-5 py-3 text-sm font-medium transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm"
            >
              Hizmetleri Gör
            </Link>
          </div>
        </div>

        {/* right: photo card */}
        <div className="rounded-[28px] border bg-white/70 p-6 backdrop-blur">
          <div className="text-sm font-medium">Psikolog</div>
          <div className="text-xs text-slate-600">Online seans</div>

          {/* big photo placeholder */}
          <div className="mt-5 overflow-hidden rounded-[24px] border bg-slate-100 shadow-sm">
            <div className="aspect-[4/5] w-full bg-gradient-to-b from-slate-100 to-slate-200" />
          </div>

          <div className="mt-4 rounded-2xl border bg-white p-4">
  <div className="text-sm font-medium">Uzmanlık Alanları</div>
  <div className="mt-3 flex flex-wrap gap-2">
    {[
      "Kaygı & Panik",
      "Depresyon",
      "Stres Yönetimi",
      "Özgüven",
      "İlişki Problemleri",
      "Travma Sonrası",
      "Sınav Kaygısı",
      "Ergen Danışmanlığı",
    ].map((t) => (
      <span
        key={t}
        className="rounded-full border bg-white px-3 py-2 text-xs text-slate-700"
      >
        {t}
      </span>
    ))}
  </div>

  <div className="mt-3 text-xs text-slate-600">
    Seanslar online yapılır. Uygun saatleri “Randevu Al” ekranında görebilirsiniz.
  </div>
</div>

        </div>
      </div>
    </section>
  );
}
