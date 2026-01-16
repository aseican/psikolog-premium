import Link from "next/link";
import { Container } from "@/components/layout/Container";

export default function GirisPage() {
  return (
    <Container>
      <section className="mx-auto max-w-xl rounded-3xl border p-8">
        <h1 className="text-2xl font-semibold">Danışan Portalı</h1>
        <p className="mt-2 text-slate-700">
          Bu alan demo amaçlıdır. Yakında randevu takibi, iptal/erteleme ve bilgilendirme özellikleri eklenecektir.
        </p>

        <div className="mt-6 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
          Şimdilik randevu almak için <b>Randevu Al</b> sayfasını kullanabilirsiniz.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/randevu"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Randevu Al
          </Link>

          <Link
            href="/iletisim"
            className="rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-slate-50"
          >
            İletişim
          </Link>
        </div>
      </section>
    </Container>
  );
}
