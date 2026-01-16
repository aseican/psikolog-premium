import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { services } from "@/lib/mock/site";

export default function ServicesPage() {
  return (
    <Container>
      <section className="rounded-3xl border p-8">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Hizmetler</h1>
            <p className="mt-2 text-slate-700">
              Aşağıdaki hizmetlerden size uygun olanı seçip randevu oluşturabilirsiniz.
            </p>
          </div>

          <Link
            href="/randevu"
            className="mt-2 inline-flex w-fit rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Randevu Al
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <div
              key={s.id}
              className="rounded-3xl border p-6 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
            >
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-700">{s.description}</p>

              <div className="mt-4 rounded-2xl border bg-white p-4 text-sm">
                <div className="text-slate-600">Süre</div>
                <div className="font-medium">{s.durationMin} dk</div>

                <div className="mt-3 text-slate-600">Ücret</div>
                <div className="font-medium">{s.priceNote || "Bilgi için iletişime geçin."}</div>
              </div>

              <Link
                href="/randevu"
                className="mt-5 inline-flex w-fit rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-white"
              >
                Bu hizmet için randevu
              </Link>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}
