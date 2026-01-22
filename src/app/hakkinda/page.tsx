"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Container } from "@/components/layout/Container";
import { supabase } from "@/lib/supabase";

type PersonKey = "p1" | "p2";

type Person1 = {
  name: string;
  role: string;
  image: string;
  intro: string;
  institutions: string[];
  thesis: string;
  experience: string;
  approach: string[];
  specializations: string[];
  trainings: string[];
  footer: string;
};

type Person2 = {
  name: string;
  role: string;
  image: string;
  intro: string;
  services: { title: string; description: string }[];
  applications: { title: string; description: string }[];
};

type AboutData = {
  person1: Person1;
  person2: Person2;
};

export default function AboutPage() {
  const [active, setActive] = useState<PersonKey | null>("p1");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AboutData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: result } = await supabase
      .from("cms_blocks")
      .select("data")
      .eq("key", "about")
      .single();

    if (result?.data) {
      setData(result.data as AboutData);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div className="bg-[var(--site-bg)]">
        <Container>
          <section className="py-20 text-center">
            <p className="text-slate-600">Yükleniyor...</p>
          </section>
        </Container>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-[var(--site-bg)]">
        <Container>
          <section className="py-20 text-center">
            <p className="text-slate-600">Sayfa bulunamadı.</p>
          </section>
        </Container>
      </div>
    );
  }

  const { person1, person2 } = data;

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
                    src={person1.image}
                    alt={person1.name}
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
                  {person1.name}
                </div>
                <div className="mt-1 text-sm text-slate-600">{person1.role}</div>
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
                <div className="relative aspect-[4/5] w-full">
                  {person2.image ? (
                    <Image
                      src={person2.image}
                      alt={person2.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-[1.03]"
                      priority
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-b from-slate-100 to-slate-200 transition duration-500 group-hover:scale-[1.01]" />
                  )}
                </div>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />

                <div className="pointer-events-none absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-3 py-2 text-xs text-slate-800 shadow-sm backdrop-blur opacity-0 transition duration-300 group-hover:opacity-100">
                  Hakkında bilgi al <span className="translate-y-[1px]">→</span>
                </div>
              </div>

              <div className="p-5">
                <div className="text-lg font-semibold text-slate-900">{person2.name}</div>
                <div className="mt-1 text-sm text-slate-600">{person2.role}</div>
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
                        {person1.name}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">{person1.role}</p>
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                        {person2.name}
                      </h2>
                      <p className="mt-2 text-sm text-slate-600">{person2.role}</p>
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
                  <p
                    className="mt-6 max-w-3xl text-slate-700"
                    dangerouslySetInnerHTML={{ __html: person1.intro }}
                  />

                  <div className="mt-6 max-w-3xl rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm">
                    <div className="text-sm font-medium text-slate-900">
                      Lisans Döneminde Görev Aldığı Kurumlar
                    </div>
                    <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                      {person1.institutions.map((inst, i) => (
                        <li key={i}>{inst}</li>
                      ))}
                    </ul>
                  </div>

                  <p
                    className="mt-6 max-w-3xl text-slate-700"
                    dangerouslySetInnerHTML={{ __html: person1.thesis }}
                  />

                  <p className="mt-4 max-w-3xl text-slate-700">{person1.experience}</p>

                  {person1.approach.map((text, i) => (
                    <p
                      key={i}
                      className="mt-6 max-w-3xl text-slate-700"
                      dangerouslySetInnerHTML={{ __html: text }}
                    />
                  ))}

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm">
                      <div className="text-sm font-medium text-slate-900">
                        Uzmanlık Alanları
                      </div>
                      <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                        {person1.specializations.map((spec, i) => (
                          <li key={i}>{spec}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm">
                      <div className="text-sm font-medium text-slate-900">
                        Uygulayıcı Eğitimleri
                      </div>
                      <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                        {person1.trainings.map((training, i) => (
                          <li key={i}>{training}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p
                    className="mt-6 max-w-3xl text-slate-700"
                    dangerouslySetInnerHTML={{ __html: person1.footer }}
                  />
                </>
              )}

              {active === "p2" && (
                <>
                  {person2.intro && (
                    <p
                      className="mt-6 max-w-3xl text-slate-700"
                      dangerouslySetInnerHTML={{ __html: person2.intro }}
                    />
                  )}

                  <div className="mt-8 grid gap-4 md:grid-cols-2">
                    {(person2.services?.length ?? 0) > 0 && (
                      <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm">
                        <div className="text-sm font-medium text-slate-900">
                          Hizmetlerimiz
                        </div>
                        <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                          {person2.services.map((service, i) => (
                            <li key={i}>
                              <strong>{service.title}:</strong> {service.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(person2.applications?.length ?? 0) > 0 && (
                      <div className="rounded-2xl border border-slate-200/70 bg-white/70 p-5 shadow-sm">
                        <div className="text-sm font-medium text-slate-900">
                          Uygulamalarımız
                        </div>
                        <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                          {person2.applications.map((app, i) => (
                            <li key={i}>
                              <strong>{app.title}:</strong> {app.description}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </section>
      </Container>
    </div>
  );
}
