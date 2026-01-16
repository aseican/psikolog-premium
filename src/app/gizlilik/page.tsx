import { Container } from "@/components/layout/Container";

export default function Gizlilik() {
  return (
    <Container>
      <section className="rounded-3xl border p-8">
        <h1 className="text-2xl font-semibold">Gizlilik Politikası</h1>
        <p className="mt-3 text-slate-700">
          Gizliliğiniz önemlidir. Paylaşılan bilgiler etik ilkeler ve mevzuat kapsamında korunur.
        </p>

        <div className="mt-6 grid gap-4 text-sm text-slate-700">
          <div className="rounded-2xl border p-5">
            <div className="font-medium">Toplanan Bilgiler</div>
            <p className="mt-2">Randevu ve iletişim süreçleri için gerekli temel bilgiler.</p>
          </div>
          <div className="rounded-2xl border p-5">
            <div className="font-medium">Paylaşım</div>
            <p className="mt-2">Yasal zorunluluklar dışında üçüncü kişilerle paylaşım yapılmaz.</p>
          </div>
          <div className="rounded-2xl border p-5">
            <div className="font-medium">İletişim</div>
            <p className="mt-2">Gizlilikle ilgili talepler için iletişim sayfasından ulaşabilirsiniz.</p>
          </div>
        </div>
      </section>
    </Container>
  );
}
