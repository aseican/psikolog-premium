import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { services } from "@/lib/mock/site";

export default function ServicesPage() {
  return (
    <div className="bg-[var(--site-bg)]">
      <Container>
        <section className="py-8">
          {/* Header */}
          <div className="rounded-[32px] border border-slate-200/70 bg-gradient-to-br from-white/80 to-white/50 p-8 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-700 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Profesyonel Danışmanlık Hizmetleri
                </div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Hizmetlerimiz</h1>
                <p className="mt-3 max-w-xl text-base text-slate-700">
                  Uzmanlarımızdan destek almak için size en uygun hizmeti seçip randevu oluşturabilirsiniz.
                </p>
              </div>

              <Link
                href="/randevu"
                className="group inline-flex w-fit items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-medium text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/20"
              >
                Randevu Oluştur
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>
          </div>

          {/* Services Grid */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s) => (
              <div
                key={s.id}
                className="group relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50"
              >
                {/* Gradient Accent */}
                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 opacity-60 transition group-hover:scale-150" />

                <div className="relative">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 text-xl">
                    {s.icon || "✨"}
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.description}</p>

                  {/* Info Card */}
                  <div className="mt-5 rounded-2xl border border-slate-100 bg-gradient-to-br from-slate-50/80 to-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Süre</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">{s.durationMin} dakika</div>
                      </div>
                      <div className="h-8 w-px bg-slate-200" />
                      <div className="text-right">
                        <div className="text-xs font-medium uppercase tracking-wide text-slate-500">Ücret</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">{s.priceNote || "Bilgi için iletişime geçin"}</div>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/randevu"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                  >
                    <span className="text-center leading-tight">
                      Uzmanlarımızdan Destek Almak İçin<br />
                      <span className="text-xs text-slate-600">Randevu Oluşturabilirsiniz</span>
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-10 rounded-[32px] border border-slate-200/70 bg-gradient-to-r from-slate-900 to-slate-800 p-8 text-center shadow-xl">
            <h2 className="text-2xl font-semibold text-white">Hangi Hizmet Size Uygun?</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-300">
              Emin değilseniz ücretsiz ön görüşme ile ihtiyaçlarınızı birlikte değerlendirebiliriz.
            </p>
            <Link
              href="/iletisim"
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-medium text-slate-900 shadow-lg transition hover:bg-slate-50"
            >
              İletişime Geçin
              <span>→</span>
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
