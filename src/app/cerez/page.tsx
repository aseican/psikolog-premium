import { Container } from "@/components/layout/Container";

export default function Cerez() {
  return (
    <Container>
      <section className="rounded-3xl border p-8">
        <h1 className="text-2xl font-semibold">Çerez Politikası</h1>
        <p className="mt-3 text-slate-700">
          Web sitesinin düzgün çalışması ve deneyimin iyileştirilmesi için çerezler kullanılabilir.
        </p>

        <div className="mt-6 grid gap-4 text-sm text-slate-700">
          <div className="rounded-2xl border p-5">
            <div className="font-medium">Zorunlu Çerezler</div>
            <p className="mt-2">Site güvenliği ve temel işlevler için gereklidir.</p>
          </div>
          <div className="rounded-2xl border p-5">
            <div className="font-medium">Analitik</div>
            <p className="mt-2">Kullanım istatistikleri için (opsiyonel) analitik çerezler kullanılabilir.</p>
          </div>
          <div className="rounded-2xl border p-5">
            <div className="font-medium">Kontrol</div>
            <p className="mt-2">Tarayıcı ayarlarından çerezleri yönetebilir veya silebilirsiniz.</p>
          </div>
        </div>
      </section>
    </Container>
  );
}
