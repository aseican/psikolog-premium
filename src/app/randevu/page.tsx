"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/layout/Container";
import { supabase } from "@/lib/supabase";

type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Basit slot generator (hafta içi 10:00-18:00)
function generateSlots(dateStr: string): string[] {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  
  // Cumartesi (6) ve Pazar (0) dolu
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return [];
  }

  const slots: string[] = [];
  for (let h = 10; h < 18; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots;
}

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [otpStage, setOtpStage] = useState<"FORM" | "OTP" | "DONE">("FORM");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    setLoading(true);
    const { data } = await supabase
      .from("services")
      .select("id, title, description, icon")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    setServices(data ?? []);
    if (data && data.length > 0) {
      setServiceId(data[0].id);
    }
    setLoading(false);
  }

  const selectedService = services.find((s) => s.id === serviceId);

  const slots = useMemo(() => generateSlots(date), [date]);

  const phoneDigits = phone.replace(/\D/g, "");
  const canSubmit =
    otpStage === "FORM" &&
    Boolean(selectedService) &&
    Boolean(date) &&
    Boolean(time) &&
    fullName.trim().length >= 3 &&
    email.includes("@") &&
    phoneDigits.length >= 10;

  function handleCreateAppointment() {
    setMsg(null);
    
    // Simüle edilmiş SMS OTP (gerçekte SMS API kullanılacak)
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    console.log("📱 SMS Gönderildi (DEMO):", code, "→", phone);
    alert(`🔐 Demo OTP Kodu: ${code}\n(Gerçek sistemde SMS ile gelecek)`);
    
    setOtpStage("OTP");
  }

  async function handleVerifyOtp() {
    setMsg(null);

    if (otp.trim() !== generatedOtp) {
      setMsg("❌ Doğrulama kodu hatalı!");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("appointments").insert([
      {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        date: date,
        time: time,
        message: note.trim() || null,
        status: "pending",
      },
    ]);

    setSaving(false);

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setOtpStage("DONE");
    }
  }

  function resetForm() {
    setOtpStage("FORM");
    setOtp("");
    setGeneratedOtp("");
    setFullName("");
    setEmail("");
    setPhone("");
    setNote("");
    setTime(null);
    setDate(todayISO());
    setMsg(null);
  }

  if (loading) {
    return (
      <Container>
        <section className="rounded-3xl border p-8">
          <p className="text-slate-600">Yükleniyor...</p>
        </section>
      </Container>
    );
  }

  return (
    <Container>
      <section className="rounded-3xl border p-8">
        <h1 className="text-2xl font-semibold">Randevu Al</h1>
        <p className="mt-2 text-slate-700">
          Aşağıdan uygun gün ve saat seçip randevu talebinizi oluşturabilirsiniz.
        </p>

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
                  {s.icon} {s.title}
                </option>
              ))}
            </select>

            <div className="mt-6 text-sm font-medium text-slate-700">Tarih</div>
            <input
              type="date"
              className="mt-3 w-full rounded-2xl border px-4 py-3"
              value={date}
              min={todayISO()}
              onChange={(e) => {
                setDate(e.target.value);
                setTime(null);
              }}
              disabled={otpStage !== "FORM"}
            />

            <div className="mt-6 text-sm font-medium text-slate-700">Saat</div>
            {slots.length === 0 ? (
              <div className="mt-3 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
                Bu tarihte uygun saat yok (Hafta sonu kapalı). Lütfen hafta içi bir gün seçin.
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

            <div className="mt-6 rounded-2xl border bg-blue-50 p-4 text-xs text-slate-700">
              🤖 <strong>Bot Koruması:</strong> Gerçek sistemde Cloudflare Turnstile veya reCAPTCHA entegre edilecek.
            </div>
          </div>

          {/* RIGHT: form + summary */}
          <div className="rounded-3xl border p-6">
            <div className="text-sm font-medium">Randevu Özeti</div>
            <div className="mt-3 rounded-2xl border bg-white p-4 text-sm">
              <div className="text-slate-600">Hizmet</div>
              <div className="font-medium">
                {selectedService?.icon} {selectedService?.title ?? "-"}
              </div>

              <div className="mt-3 text-slate-600">Tarih / Saat</div>
              <div className="font-medium">
                {date} {time ? `• ${time}` : "• Saat seçilmedi"}
              </div>

              <div className="mt-3 text-slate-600">Süre</div>
              <div className="font-medium">50 dk (standart)</div>
            </div>

            <div className="mt-6 text-sm font-medium text-slate-700">Bilgileriniz</div>
            <div className="mt-3 grid gap-3">
              <input
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Ad Soyad *"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={otpStage !== "FORM"}
              />
              <input
                type="email"
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="E-posta *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={otpStage !== "FORM"}
              />
              <input
                type="tel"
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Telefon (5xx xxx xx xx) *"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={otpStage !== "FORM"}
              />
              <textarea
                className="w-full rounded-2xl border px-4 py-3"
                placeholder="Belirtmek istediğiniz bir not (opsiyonel)"
                rows={3}
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
                  onClick={handleCreateAppointment}
                >
                  Randevu Oluştur
                </button>

                <p className="mt-2 text-xs text-slate-500">
                  Devam ettiğinizde SMS doğrulama adımına geçersiniz.
                </p>
              </>
            )}

            {otpStage === "OTP" && (
              <div className="mt-6 rounded-3xl border bg-slate-50 p-5">
                <div className="text-sm font-medium">📱 SMS Doğrulama</div>
                <p className="mt-2 text-sm text-slate-700">
                  <strong>{phone}</strong> numarasına 6 haneli doğrulama kodu gönderildi.
                </p>

                <div className="mt-4 grid gap-3">
                  <input
                    className="w-full rounded-2xl border px-4 py-3 text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />

                  <button
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    onClick={handleVerifyOtp}
                    disabled={saving || otp.length !== 6}
                  >
                    {saving ? "Kontrol ediliyor..." : "Kodu Doğrula"}
                  </button>

                  <button
                    className="rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-white"
                    onClick={() => setOtpStage("FORM")}
                  >
                    ← Geri dön
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  💡 <strong>Demo modunda:</strong> Kod otomatik gösterildi. Gerçek sistemde SMS ile gelecek.
                </p>
              </div>
            )}

            {otpStage === "DONE" && (
              <div className="mt-6 rounded-3xl border bg-green-50 p-5">
                <div className="text-lg font-semibold text-green-900">
                  ✅ Randevu Talebiniz Alındı!
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  Randevunuz başarıyla oluşturuldu. Onay ve detaylar kısa süre içinde SMS ve
                  e-posta ile iletilecektir.
                </p>

                <div className="mt-4 rounded-2xl border border-green-200 bg-white p-4 text-sm">
                  <p className="font-medium">📋 Randevu Detayları:</p>
                  <p className="mt-1">
                    <strong>Hizmet:</strong> {selectedService?.title}
                  </p>
                  <p>
                    <strong>Tarih:</strong> {date}
                  </p>
                  <p>
                    <strong>Saat:</strong> {time}
                  </p>
                </div>

                <button
                  className="mt-4 w-full rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-white"
                  onClick={resetForm}
                >
                  Yeni randevu oluştur
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-3xl border bg-slate-50 p-6">
          <p className="text-sm text-slate-700">
            ℹ️ <strong>Bilgilendirme:</strong>
          </p>
          <ul className="mt-2 list-disc pl-5 text-sm text-slate-600">
            <li>Randevu iptal/erteleme için en az 24 saat önceden bildirim yapılması rica edilir.</li>
            <li>Online seanslar Google Meet üzerinden gerçekleştirilir (link SMS ile gelecek).</li>
            <li>İlk seans değerlendirme amaçlıdır, devam planı birlikte belirlenir.</li>
          </ul>
        </div>
      </section>
    </Container>
  );
}