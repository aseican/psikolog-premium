"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { supabase } from "@/lib/supabase";

type ContactData = {
  phone?: string;
  email?: string;
  address?: string;
  mapEmbedHtml?: string;
};

const FALLBACK: Required<Pick<ContactData, "phone" | "email" | "address">> = {
  phone: "+90 5xx xxx xx xx",
  email: "ornek@mail.com",
  address: "İstanbul, Türkiye",
};

function extractIframeSrc(html?: string): string | null {
  if (!html) return null;
  const m = html.match(/src="([^"]+)"/i);
  return m?.[1] ?? null;
}

export default function ContactPage() {
  const [contact, setContact] = useState<ContactData>(FALLBACK);

  // Form states
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("cms_blocks")
      .select("key,data")
      .eq("key", "contact")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) return;

        const d = (data.data ?? {}) as ContactData;

        setContact({
          phone: typeof d.phone === "string" && d.phone.trim() ? d.phone.trim() : FALLBACK.phone,
          email: typeof d.email === "string" && d.email.trim() ? d.email.trim() : FALLBACK.email,
          address: typeof d.address === "string" && d.address.trim() ? d.address.trim() : FALLBACK.address,
          mapEmbedHtml: typeof d.mapEmbedHtml === "string" ? d.mapEmbedHtml : "",
        });
      });
  }, []);

  const mapSrc = useMemo(() => extractIframeSrc(contact.mapEmbedHtml), [contact.mapEmbedHtml]);

  async function handleSubmit() {
    setMsg(null);

    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      setMsg("Lütfen zorunlu alanları doldurun");
      return;
    }

    setSending(true);

    const { error } = await supabase.from("form_submissions").insert([
      {
        form_type: "contact",
        name: formName.trim(),
        email: formEmail.trim(),
        phone: formPhone.trim() || null,
        message: formMessage.trim(),
        subject: "İletişim Formu",
      },
    ]);

    setSending(false);

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setMsg("Mesajınız gönderildi! En kısa sürede size dönüş yapacağız. ✅");
      setFormName("");
      setFormEmail("");
      setFormPhone("");
      setFormMessage("");
    }
  }

  return (
    <Container>
      <section className="rounded-3xl border p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold">İletişim</h1>
            <p className="mt-2 text-slate-700">
              Sorularınız için ulaşabilirsiniz. Randevu almak için "Randevu Al" sayfasını kullanabilirsiniz.
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
          {/* LEFT: contact cards + map */}
          <div className="grid gap-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border p-6">
                <div className="text-sm text-slate-600">Telefon</div>
                <div className="mt-2 text-lg font-semibold">{contact.phone}</div>
                <p className="mt-2 text-sm text-slate-700">Hafta içi 10:00–18:00 arası dönüş yapılır.</p>
                <button
                  className="mt-4 rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  type="button"
                  onClick={() => {
  const phone = (contact.phone || "").replace(/[^0-9]/g, "");
  if (phone) {
    window.open(`https://wa.me/${phone}`, "_blank");
  } else {
    alert("Telefon numarası bulunamadı");
  }
}}
                >
                  WhatsApp
                </button>
              </div>

              <div className="rounded-3xl border p-6">
                <div className="text-sm text-slate-600">E-posta</div>
                <div className="mt-2 text-lg font-semibold">{contact.email}</div>
                <p className="mt-2 text-sm text-slate-700">Randevu dışında genel sorular için yazabilirsiniz.</p>
                <a
                  className="mt-4 inline-flex rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
                  href={`mailto:${contact.email}`}
                >
                  E-posta gönder
                </a>
              </div>
            </div>

            <div className="rounded-3xl border p-6">
              <div className="text-sm text-slate-600">Adres</div>
              <div className="mt-2 text-lg font-semibold">{contact.address}</div>

              <div className="mt-5 overflow-hidden rounded-[24px] border bg-slate-100">
                {mapSrc ? (
                  <div className="aspect-[16/9] w-full">
                    <iframe
                      src={mapSrc}
                      className="h-full w-full"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      allowFullScreen
                      aria-label="Google Maps"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] w-full bg-gradient-to-b from-slate-100 to-slate-200" />
                )}
              </div>
            </div>

            <div className="rounded-3xl border bg-slate-50 p-6">
              <div className="text-sm font-medium">Bilgilendirme</div>
              <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                <li>Randevu iptal/erteleme için en az 24 saat önce haber verilmesi rica edilir.</li>
                <li>Seanslar gizlilik ve etik ilkeler kapsamında yürütülür.</li>
                <li>Online görüşmeler güvenli bağlantı ile yapılır.</li>
              </ul>
            </div>
          </div>

          {/* RIGHT: form */}
          <div className="rounded-3xl border p-6">
            <div className="text-lg font-semibold">Mesaj Gönder</div>

            {msg && (
              <div
                className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
                  msg.includes("✅")
                    ? "border-green-200 bg-green-50 text-green-800"
                    : "border-red-200 bg-red-50 text-red-800"
                }`}
              >
                {msg}
              </div>
            )}

            <div className="mt-5 grid gap-3">
              <input
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Ad Soyad *"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
              />
              <input
                type="email"
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="E-posta *"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
              />
              <input
                type="tel"
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Telefon (opsiyonel)"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
              />
              <textarea
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Mesajınız *"
                rows={5}
                value={formMessage}
                onChange={(e) => setFormMessage(e.target.value)}
              />

              <button
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                type="button"
                onClick={handleSubmit}
                disabled={sending}
              >
                {sending ? "Gönderiliyor..." : "Gönder"}
              </button>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}