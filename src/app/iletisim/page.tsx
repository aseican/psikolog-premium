"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { site } from "@/lib/mock/site";

export default function ContactPage() {
  return (
    <Container>
      <section className="rounded-3xl border p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">İletişim</h1>
            <p className="mt-2 text-slate-700">
              Sorularınız için ulaşabilirsiniz. Randevu almak için “Randevu Al”
              sayfasını kullanabilirsiniz.
            </p>
          </div>

          <Link
            href="/randevu"
            className="inline-flex w-fit rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Randevu Al
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* LEFT: contact cards + map placeholder */}
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border p-6">
                <div className="text-sm text-slate-600">Telefon</div>
                <div className="mt-2 text-lg font-semibold">{site.phone}</div>
                <p className="mt-2 text-sm text-slate-700">
                  Hafta içi 10:00–18:00 arası dönüş yapılır.
                </p>
                <button
                  className="mt-4 rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  type="button"
                  onClick={() =>
                    alert("Demo: WhatsApp yönlendirmesi burada olacak.")
                  }
                >
                  WhatsApp (demo)
                </button>
              </div>

              <div className="rounded-3xl border p-6">
                <div className="text-sm text-slate-600">E-posta</div>
                <div className="mt-2 text-lg font-semibold">{site.email}</div>
                <p className="mt-2 text-sm text-slate-700">
                  Randevu dışında genel sorular için yazabilirsiniz.
                </p>
                <a
                  className="mt-4 inline-flex rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  href={`mailto:${site.email}`}
                >
                  E-posta gönder
                </a>
              </div>
            </div>

            <div className="rounded-3xl border p-6">
              <div className="text-sm text-slate-600">Adres</div>
              <div className="mt-2 text-lg font-semibold">{site.address}</div>
              <p className="mt-2 text-sm text-slate-700">
                Online seanslar için fiziksel konum gerekmeyebilir. Yüz yüze
                hizmet veriliyorsa burada belirtilebilir.
              </p>

              <div className="mt-5 overflow-hidden rounded-[24px] border bg-slate-100">
                <div className="aspect-[16/9] w-full bg-gradient-to-b from-slate-100 to-slate-200" />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Harita alanı (placeholder). Google Maps embed eklenecek.
              </p>
            </div>

            <div className="rounded-3xl border bg-slate-50 p-6">
              <div className="text-sm font-medium">Bilgilendirme</div>
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                <li>
                  Randevu iptal/erteleme için en az 24 saat önce haber verilmesi
                  rica edilir.
                </li>
                <li>Seanslar gizlilik ve etik ilkeler kapsamında yürütülür.</li>
                <li>Online görüşmeler güvenli bağlantı ile yapılır.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: form */}
          <div className="rounded-3xl border p-6">
            <div className="text-lg font-semibold">Mesaj Gönder</div>
            <p className="mt-2 text-sm text-slate-700">
              Bu form demo amaçlıdır. Backend bağlanınca gerçek gönderim
              yapılacaktır.
            </p>

            <div className="mt-5 grid gap-3">
              <input
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Ad Soyad"
              />
              <input
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="E-posta"
              />
              <input
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Telefon (opsiyonel)"
              />
              <textarea
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Mesajınız"
                rows={5}
              />

              <div className="rounded-2xl border bg-slate-50 p-4 text-xs text-slate-700">
                Bot doğrulama alanı (placeholder)
              </div>

              <button
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                type="button"
                onClick={() => alert("Demo: Mesaj gönderildi (simülasyon).")}
              >
                Gönder (Demo)
              </button>

              <p className="text-xs text-slate-500">
                Not: Gerçek sistemde bu form e-posta/SMS bildirimiyle birlikte
                çalışacak.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
