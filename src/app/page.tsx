import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { getHero, getServices, getFaqs, getHeroWords } from "@/lib/data/site";
import HeroWords from "@/components/HeroWords";
import FaqClient from "@/components/FaqClient";

export default async function Page() {
  const hero = await getHero();
  const services = await getServices();
  const faqs = await getFaqs();
  const words = await getHeroWords();

  return (
    <div className="bg-[var(--site-bg)]">
      <Container>
        {/* HERO */}
        <section className="py-12 md:py-16">
          <div className="grid items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            {/* LEFT */}
            <div className="min-w-0 pt-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-300/60 bg-white/50 px-4 py-2 text-xs text-slate-700 shadow-sm backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                Gizlilik • Güven • Profesyonellik
              </div>

              <h1 className="mt-6 max-w-2xl text-balance leading-[1.02] tracking-[-0.02em] text-slate-900">
                <span className="block text-4xl font-semibold md:text-5xl lg:text-6xl">
                  Zihinsel Sağlık İçin
                </span>

                <span className="mt-2 block">
                  <span className="text-5xl font-semibold tracking-tight md:text-6xl lg:text-7xl">
                    <span className="relative inline-block">
                      <span className="block">Bilimsel</span>

                      <span className="mt-1 block">
                        <span className="relative inline-block h-[1.05em] overflow-hidden align-baseline font-signature tracking-wide">
                          <HeroWords words={words} />
                        </span>
                      </span>

                      <span className="mt-1 block">Çözümler</span>

                      <span
                        aria-hidden
                        className="pointer-events-none absolute -bottom-2 left-0 h-[10px] w-full rounded-full bg-slate-900/10 blur-[6px]"
                      />
                    </span>
                  </span>
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-700 md:text-lg">
                {hero.lead}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/randevu"
                  className="group inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
                >
                  Randevu Al
                  <span className="ml-2 transition-transform group-hover:translate-x-0.5">→</span>
                </Link>

                <Link
                  href="/hakkinda"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/70 bg-white/60 px-6 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-white/80 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                >
                  Hakkımda
                </Link>

                <Link
                  href="/iletisim"
                  className="inline-flex items-center justify-center rounded-full border border-slate-300/50 bg-transparent px-6 py-3 text-sm font-medium text-slate-800 transition hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15"
                >
                  İletişim
                </Link>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/75 hover:shadow">
                  <div className="text-sm font-semibold text-slate-900">Online Seans</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    Güvenli bağlantı ile, bulunduğun yerden.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200/70 bg-white/60 p-6 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/75 hover:shadow">
                  <div className="text-sm font-semibold text-slate-900">Ön Bilgilendirme</div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    Testler bölümünde kısa bir ön değerlendirme yapabilirsin.
                  </p>
                </div>
              </div>
            </div>

            {/* RIGHT: PHOTO CARD */}
            <div className="mx-auto w-full max-w-[440px]">
              <div className="rounded-[32px] border border-slate-200/70 bg-white/60 p-3 shadow-sm backdrop-blur">
                <div className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-slate-100">
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src="/images/eda-keklik-2.png"
                      alt="Psikolog Eda Keklik Akalp"
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>

                <div className="mt-4 rounded-[26px] border border-slate-200/70 bg-white/70 p-6 shadow-sm">
                  <div className="text-lg font-semibold text-slate-900">
                    Psikolog Eda Keklik Akalp
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate-700">
                    Bireysel Terapi • Aile & Çift Terapisi • Çocuk & Ergen • Oyun Terapisi • Cinsel Terapi
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {["Güven", "Tarafsızlık", "Anlayış"].map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-slate-200/70 bg-white/60 px-3 py-2 text-xs text-slate-700 shadow-sm"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/randevu"
                      className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30"
                    >
                      Uygun Saatleri Gör
                    </Link>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-center text-xs text-slate-600">
                Seanslar etik ilkeler ve gizlilik esasına göre yürütülür.
              </p>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <section className="pb-12 md:pb-14">
          <div className="rounded-[32px] border border-slate-200/70 bg-gradient-to-br from-white/80 to-white/50 p-8 shadow-sm backdrop-blur md:p-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-slate-200/70 bg-white/70 px-4 py-1.5 text-xs font-medium text-slate-700 backdrop-blur">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Profesyonel Danışmanlık
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
                  Hizmetlerimiz
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-700 md:text-base">
                  Uzmanlarımızdan destek almak için size uygun hizmeti seçip randevu oluşturabilirsiniz.
                </p>
              </div>

              <Link
                href="/hizmetler"
                className="group inline-flex w-fit items-center gap-2 rounded-2xl border border-slate-300/70 bg-white/70 px-5 py-3 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-white/90 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
              >
                Tümünü Gör
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </Link>
            </div>

            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((s: any) => (
                <div
                  key={s.id}
                  className="group relative overflow-hidden rounded-[24px] border border-slate-200/70 bg-white/70 p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50"
                >
                  {/* Gradient Accent */}
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-50 opacity-60 transition group-hover:scale-150" />

                  <div className="relative">
                    <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-lg">
                      {s.icon || "✨"}
                    </div>

                    <h3 className="text-lg font-semibold text-slate-900">{s.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">{s.description}</p>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">{s.durationMin}</span> dakika
                      </div>
                      <Link
                        href="/randevu"
                        className="inline-flex items-center gap-1 text-sm font-medium text-slate-900 transition hover:gap-2"
                      >
                        Randevu
                        <span>→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16">
          <div className="rounded-3xl border border-slate-200/70 bg-white/60 p-8 shadow-sm backdrop-blur md:p-10">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              Sık Sorulan Sorular
            </h2>

            <FaqClient faqs={faqs} />
          </div>
        </section>
      </Container>
    </div>
  );
}
