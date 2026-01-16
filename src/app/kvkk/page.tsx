import { Container } from "@/components/layout/Container";

export default function Kvkk() {
  return (
    <Container>
      <section className="rounded-3xl border p-8">
        <h1 className="text-2xl font-semibold">KVKK Aydınlatma Metni</h1>
        <p className="mt-3 text-slate-700">
          Bu metin taslaktır. Danışanların kişisel verileri; randevu oluşturma, iletişim ve hizmet sunumu amaçlarıyla
          sınırlı olarak işlenir.
        </p>

        <div className="mt-6 grid gap-4 text-sm text-slate-700">
          <div className="rounded-2xl border p-5">
            <div className="font-medium">İşlenen Veriler</div>
            <p className="mt-2">Ad-soyad, iletişim bilgileri, randevu bilgileri ve gerekli durumlarda danışan notları.</p>
          </div>
          <div className="rounded-2xl border p-5">
            <div className="font-medium">Saklama Süresi</div>
            <p className="mt-2">Yasal yükümlülükler ve hizmet gerekliliklerine uygun süre boyunca.</p>
          </div>
          <div className="rounded-2xl border p-5">
            <div className="font-medium">Haklarınız</div>
            <p className="mt-2">KVKK kapsamında bilgi talep etme, düzeltme, silme ve itiraz haklarına sahipsiniz.</p>
          </div>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Not: Nihai metin müşteri/avukat onayıyla güncellenecektir.
        </p>
      </section>
    </Container>
  );
}
