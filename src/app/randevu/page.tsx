"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { services } from "@/lib/mock/site";
import { defaultAvailability } from "@/lib/mock/availability";
import { getSlotsForDate } from "@/lib/mock/slots";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function BookingPage() {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [otpStage, setOtpStage] = useState<"FORM" | "OTP" | "DONE">("FORM");
  const [otp, setOtp] = useState("");

  const selectedService = services.find((s) => s.id === serviceId);

  const slots = useMemo(
    () => getSlotsForDate(date, defaultAvailability),
    [date]
  );

  const phoneDigits = phone.replace(/\D/g, "");
  const canSubmit =
    otpStage === "FORM" &&
    Boolean(selectedService) &&
    Boolean(date) &&
    Boolean(time) &&
    fullName.trim().length >= 3 &&
    email.includes("@") &&
    phoneDigits.length >= 10;

  return (
    <Container>
      <section className="rounded-3xl border p-8">
        <h1 className="text-2xl font-semibold">Randevu Al</h1>
        <p className="mt-2 text-slate-700">
          Aşağıdan uygun gün ve saat seçip randevu talebi oluşturabilirsiniz.
          (Şimdilik demo akışı — backend bağlanınca Google Meet otomatikleşecek.)
        </p>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* LEFT: selection */}
          <div className="rounded-3xl border p-6">
            <div className="text-sm font-medium text-slate-700">Hizmet</div>
            <select
              className="mt-3 w-full rounded-2xl border px-4 py-3"
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              disabled={otpStage !== "FORM"}
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.durationMin} dk)
                </option>
              ))}
            </select>

            <div className="mt-6 text-sm font-medium text-slate-700">Tarih</div>
            <input
              type="date"
              className="mt-3 w-full rounded-2xl border px-4 py-3"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime(null);
              }}
              disabled={otpStage !== "FORM"}
            />

            <div className="mt-6 text-sm font-medium text-slate-700">Saat</div>
            {slots.length === 0 ? (
              <div className="mt-3 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                Bu tarihte uygun saat yok. Lütfen başka bir gün seçin.
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.map((s) => {
                  const active = time === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setTime(s)}
                      disabled={otpStage !== "FORM"}
                      className={[
                        "rounded-2xl border px-3 py-2 text-center text-sm transition",
                        active
                          ? "bg-slate-900 text-white"
                          : "hover:bg-slate-50",
                        otpStage !== "FORM"
                          ? "opacity-50 cursor-not-allowed"
                          : "",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-6 rounded-2xl border bg-slate-50 p-4 text-xs text-slate-700">
              Bot doğrulama alanı (placeholder) — gerçek sistemde Turnstile/Recaptcha
              eklenecek.
            </div>
          </div>

          {/* RIGHT: form + summary */}
          <div className="rounded-3xl border p-6">
            <div className="text-sm font-medium">Randevu Özeti</div>
            <div className="mt-3 rounded-2xl border bg-white p-4 text-sm">
              <div className="text-slate-600">Hizmet</div>
              <div className="font-medium">{selectedService?.title ?? "-"}</div>

              <div className="mt-3 text-slate-600">Tarih / Saat</div>
              <div className="font-medium">
                {date} {time ? `• ${time}` : ""}
              </div>

              <div className="mt-3 text-slate-600">Süre</div>
              <div className="font-medium">
                {selectedService?.durationMin ?? "-"} dk
              </div>
            </div>

            <div className="mt-6 text-sm font-medium text-slate-700">Bilgiler</div>
            <div className="mt-3 grid gap-3">
              <input
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Ad Soyad"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={otpStage !== "FORM"}
              />
              <input
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpStage !== "FORM"}
              />
              <input
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Telefon (5xx...)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpStage !== "FORM"}
              />
              <textarea
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Not (opsiyonel)"
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                disabled={otpStage !== "FORM"}
              />
            </div>

            {otpStage === "FORM" && (
              <>
                <button
                  className={[
                    "mt-6 w-full rounded-2xl px-5 py-3 text-sm font-medium text-white transition",
                    canSubmit
                      ? "bg-slate-900 hover:bg-slate-800"
                      : "bg-slate-900/50 cursor-not-allowed",
                  ].join(" ")}
                  disabled={!canSubmit}
                  onClick={() => setOtpStage("OTP")}
                >
                  Randevu Oluştur
                </button>

                <p className="mt-2 text-xs text-slate-500">
                  Devam ettiğinizde SMS doğrulama adımına geçersiniz. (Demo)
                </p>
              </>
            )}

            {otpStage === "OTP" && (
              <div className="mt-6 rounded-3xl border p-5">
                <div className="text-sm font-medium">SMS Doğrulama</div>
                <p className="mt-2 text-sm text-slate-700">
                  <b>{phone || "Telefon"}</b> numarasına 6 haneli doğrulama kodu
                  gönderildi (demo).
                </p>

                <div className="mt-3 grid gap-3">
                  <input
                    className="w-full rounded-2xl border px-4 py-3"
                    placeholder="6 haneli kod"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />

                  <button
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
                    onClick={() => {
                      if (otp.trim().length < 4) {
                        alert("Demo: Kod girin.");
                        return;
                      }
                      setOtpStage("DONE");
                    }}
                  >
                    Kodu Doğrula
                  </button>

                  <button
                    className="rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-slate-50"
                    onClick={() => setOtpStage("FORM")}
                  >
                    Geri dön
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-500">
                  Backend geldiğinde burada gerçek SMS sağlayıcısı (Twilio/Netgsm/İletiMerkezi)
                  entegre edilecek.
                </p>
              </div>
            )}

            {otpStage === "DONE" && (
              <div className="mt-6 rounded-3xl border bg-slate-50 p-5">
                <div className="text-sm font-medium text-slate-900">
                  ✅ Randevu Talebiniz Alındı
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  Seçtiğiniz tarih ve saat için randevu talebiniz oluşturuldu. Onay ve detaylar
                  SMS/E-posta ile iletilecektir. (Demo)
                </p>

                <button
                  className="mt-4 rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-white"
                  onClick={() => {
                    // reset
                    setOtpStage("FORM");
                    setOtp("");
                  }}
                >
                  Yeni randevu oluştur
                </button>
              </div>
            )}

            <p className="mt-6 text-xs text-slate-500">
              Sonraki adım: Bu akış backend’e bağlanıp çakışma kontrolü + Google Calendar etkinliği
              + Google Meet link üretimi yapacak.
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
