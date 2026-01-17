"use client";

import { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/layout/Container";

type PersonKey = "p1" | "p2";

export default function AboutPage() {
  const [active, setActive] = useState<PersonKey | null>("p1");

  return (
    <div className="bg-[var(--site-bg)]">
      <Container>
        <section className="py-8">
          <h1 className="text-3xl font-semibold tracking-tight">Hakkımda</h1>
          <p className="mt-3 max-w-2xl text-base text-slate-700">
            Uzmanlık alanlarım ve çalışma yaklaşımım hakkında bilgi alabilirsiniz.
          </p>

          {/* PERSON CARDS */}
          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {/* CARD 1 */}
            <button
              type="button"
              onClick={() => setActive("p1")}
              className={[
                "group relative overflow-hidden rounded-[28px] border bg-white text-left transition",
                "border-slate-200 shadow-sm",
                "hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
                active === "p1" ? "ring-1 ring-slate-900/10" : "",
              ].join(" ")}
              aria-expanded={active === "p1"}
            >
              <div className="relative overflow-hidden">
                <div className="relative aspect-[4/5] w-full">
                  <Image
                    src="/images/eda-keklik.jpg"
                    alt="Psikolog Eda Keklik Akalp"
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    priority
                  />
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-2 text-xs text-slate-800 shadow-sm backdrop-blur opacity-0 transition duration-300 group-hover:opacity-100">
                  Hakkında bilgi al <span className="translate-y-[1px]">→</span>
                </div>
              </div>

              <div className="p-5">
                <div className="text-lg font-semibold text-slate-900">
                  Psikolog Eda Keklik Akalp
                </div>
                <div className="mt-1 text-sm text-slate-600">Bireysel Danışmanlık</div>
              </div>
            </button>

            {/* CARD 2 */}
            <button
              type="button"
              onClick={() => setActive("p2")}
              className={[
                "group relative overflow-hidden rounded-[28px] border bg-white text-left transition",
                "border-slate-200 shadow-sm",
                "hover:-translate-y-0.5 hover:shadow-md hover:border-slate-300",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20",
                active === "p2" ? "ring-1 ring-slate-900/10" : "",
              ].join(" ")}
              aria-expanded={active === "p2"}
            >
              <div className="relative overflow-hidden">
                <div className="aspect-[4/5] w-full bg-gradient-to-b from-slate-100 to-slate-200 transition duration-500 group-hover:scale-[1.01]" />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-2 text-xs text-slate-800 shadow-sm backdrop-blur opacity-0 transition duration-300 group-hover:opacity-100">
                  Hakkında bilgi al <span className="translate-y-[1px]">→</span>
                </div>
              </div>

              <div className="p-5">
                <div className="text-lg font-semibold text-slate-900">Psikolojik Danışman</div>
                <div className="mt-1 text-sm text-slate-600">Ergen & Aile Danışmanlığı</div>
              </div>
            </button>
          </div>

          {/* DETAIL */}
          {active === null ? (
            <div className="mt-10 rounded-[32px] border border-slate-200/70 bg-white/60 p-8 text-sm text-slate-700 shadow-sm backdrop-blur">
              Çalışma yaklaşımımı ve uzmanlık alanlarımı keşfedin.
            </div>
          ) : (
            <div className="mt-10 rounded-[32px] border border-slate-200/70 bg-white/70 p-8 shadow-sm backdrop-blur">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  {active === "p1" ? (
                    <>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Psikolog Eda Keklik Akalp
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">Bireysel Danışmanlık</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        Psikolojik Danışman
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">Ergen & Aile Danışmanlığı</p>
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="inline-flex w-fit items-center justify-center rounded-full border border-slate-300/70 bg-white/70 px-4 py-2 text-sm font-medium text-slate-900 shadow-sm transition hover:bg-white/90 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20"
                >
                  Kapat
                </button>
              </div>

              {active === "p1" && (
                <>
                  <p className="mt-6 max-w-3xl text-slate-700">
                    Psikolog Eda Keklik Akalp, İstanbul Kent Üniversitesi Psikoloji Bölümü’nden{" "}
                    <b>onur derecesiyle</b> mezun olmuştur (3.42 AGNO). Lisans eğitimi boyunca akademik
                    başarısının yanı sıra; rehabilitasyon merkezleri, hastane, dershane, anaokulu ve çeşitli
                    özel kliniklerde kapsamlı staj deneyimleri edinmiştir.
                  </p>

                  <div className="mt-6 max-w-3xl rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm">
                    <div className="text-sm font-medium text-slate-900">Lisans Döneminde Görev Aldığı Kurumlar</div>
                    <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                      <li>Ayna Psikolojik Danışmanlık Merkezi</li>
                      <li>Erk Danışmanlık Merkezi</li>
                      <li>Hay Danışmanlık Merkezi</li>
                      <li>Şişli VIP Final Eğitim Kurumları</li>
                      <li>Ada Psikoloji Eğitim ve Danışmanlık Merkezi</li>
                    </ul>
                  </div>

                  <p className="mt-6 max-w-3xl text-slate-700">
                    Bitirme tezini,{" "}
                    <b>
                      “Lise Öğrencilerinin Madde Bağımlılığı ile İlgili Bilgi ve Farkındalık Düzeyi ile Bağımlılık
                      Yapıcı Maddelere Karşı Tutumlarının İncelenmesi”
                    </b>{" "}
                    başlığıyla tamamlamıştır.
                  </p>

                  <p className="mt-4 max-w-3xl text-slate-700">
                    Mezuniyetinin ardından Bahçeşehir Dora Özel Eğitim ve Rehabilitasyon Merkezi ile Cebeci Özel
                    Eğitim ve Rehabilitasyon Merkezi’nde aktif olarak kurum psikoloğu olarak görev yapmıştır.
                  </p>

                  <p className="mt-6 max-w-3xl text-slate-700">
                    Psikolog Eda Keklik Akalp, her bireyin kendini güvenle ifade edebileceği bir alan yaratmayı
                    önemser. Psikolojik destek sürecinde bireylerin içsel güçlerini keşfetmelerine ve
                    yaşamlarındaki zorluklarla baş etme becerilerini geliştirmelerine eşlik etmektedir.
                  </p>

                  <p className="mt-4 max-w-3xl text-slate-700">
                    Danışmanlık süreçlerinde <b>güven, anlayış ve tarafsızlık</b> ilkelerine bağlı kalarak; bireyin
                    kendini tanıma yolculuğunda, kaygılarının ötesindeki potansiyeline ulaşmasını amaçlamaktadır.
                  </p>

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm">
                      <div className="text-sm font-medium text-slate-900">Uzmanlık Alanları</div>
                      <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                        <li>Bireysel Terapi</li>
                        <li>Aile ve Çift Terapisi</li>
                        <li>Çocuk ve Ergen Terapisi</li>
                        <li>Oyun Terapisi</li>
                        <li>Cinsel Terapi</li>
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm">
                      <div className="text-sm font-medium text-slate-900">Uygulayıcı Eğitimleri</div>
                      <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                        <li>Bilişsel Davranışçı Terapi (BDT)</li>
                        <li>Aile Danışmanlığı</li>
                        <li>İlişki ve Evlilik Danışmanlığı</li>
                        <li>Cinsel Terapi</li>
                        <li>Oyun Terapisi</li>
                        <li>Çocuk Merkezli Oyun Terapisi</li>
                        <li>Deneyimsel Oyun Terapisi</li>
                      </ul>
                    </div>
                  </div>

                  <p className="mt-6 max-w-3xl text-slate-700">
                    Ayrıca <b>Aile Danışmanlığı Eğitimini</b> tamamlamış olup bu alanda da danışmanlık hizmeti
                    vermektedir. Halihazırda danışan kabulünü <b>Başakşehir Sevgi Danışmanlık Merkezi</b> üzerinden
                    sürdürmektedir.
                  </p>
                </>
              )}

              {active === "p2" && (
                <>
                  <p className="mt-6 max-w-3xl text-slate-700">
                    Psikolojik danışmanlık alanında eğitim aldıktan sonra, ergen ve aile danışmanlığı üzerine
                    çalışmaya başladım. Süreçlerde aileyi ve bireyi birlikte ele alan bir yaklaşım benimsiyorum.
                  </p>

                  <p className="mt-4 max-w-3xl text-slate-700">
                    Akademik stres, kimlik gelişimi, aile içi iletişim ve ilişki dinamikleri temel çalışma
                    alanlarım arasında yer alır. Seanslar danışanın ihtiyaçlarına göre yapılandırılır.
                  </p>
                </>
              )}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
