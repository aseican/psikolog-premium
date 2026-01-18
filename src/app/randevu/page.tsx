"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/layout/Container";
import { supabase } from "@/lib/supabase";


type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

type Settings = {
  recaptchaEnabled?: boolean;
  recaptchaSiteKey?: string;
  phoneVerificationRequired?: boolean;
};

type OtpStage = "FORM" | "OTP" | "DONE";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// Çalışma saatlerine göre slot üretici
async function getAvailableSlots(
  date: string,
  workingHours: any,
  holidays: string[]
): Promise<string[]> {
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay();

  // Tatil günü kontrolü
  if (holidays.includes(date)) return [];

  // Gün adını al (monday, tuesday, ...)
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const dayName = dayNames[dayOfWeek];

  const daySchedule = workingHours[dayName];

  // Gün kapalıysa
  if (!daySchedule || !daySchedule.enabled) return [];

  // Slot üret
  const slots: string[] = [];
  const [startHour, startMin] = daySchedule.start.split(":").map(Number);
  const [endHour, endMin] = daySchedule.end.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMin < endMin)
  ) {
    slots.push(
      `${String(currentHour).padStart(2, "0")}:${String(currentMin).padStart(
        2,
        "0"
      )}`
    );

    currentMin += 30; // Her 30 dakikada bir slot
    if (currentMin >= 60) {
      currentMin = 0;
      currentHour += 1;
    }
  }

  return slots;
}

const SITE_KEY = "6LdKcU4sAAAAAOUpFGWjAHYrVMZx5vXtEczDTPiY";

export default function BookingPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [serviceId, setServiceId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [time, setTime] = useState<string | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [otpStage, setOtpStage] = useState<OtpStage>("FORM");
  const [otp, setOtp] = useState("");
  const [sendingCode, setSendingCode] = useState(false);

  const [msg, setMsg] = useState<string | null>(null);

  // Çalışma saatleri ve tatil günleri
  const [workingHours, setWorkingHours] = useState<any>({});
  const [holidays, setHolidays] = useState<string[]>([]);
  const [slots, setSlots] = useState<string[]>([]);

  // reCAPTCHA script yükle
  useEffect(() => {
    if (document.getElementById("recaptcha-script")) return;

    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.onerror = () => {
      console.warn("reCAPTCHA script yüklenemedi");
    };
    document.head.appendChild(script);
  }, []);

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    async function loadAll() {
      setLoading(true);

      // Hizmetler
      const { data: servicesData } = await supabase
        .from("services")
        .select("id, title, description, icon")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      setServices(servicesData ?? []);
      if (servicesData && servicesData.length > 0) {
        setServiceId(servicesData[0].id);
      }

      // Public settings
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        setSettings(json);
      } else {
        setSettings({
          recaptchaEnabled: false,
          phoneVerificationRequired: false,
        });
      }

      // Çalışma saatleri ve tatil günlerini al
      const { data: fullSettings } = await supabase
        .from("cms_blocks")
        .select("data")
        .eq("key", "settings")
        .single();

      if (fullSettings?.data) {
        setWorkingHours(fullSettings.data.workingHours || {});
        setHolidays(fullSettings.data.holidays || []);
      }

      setLoading(false);
    }

    loadAll();
  }, []);

  // Tarih değiştiğinde slotları güncelle
  useEffect(() => {
    if (date && Object.keys(workingHours).length > 0) {
      getAvailableSlots(date, workingHours, holidays).then(setSlots);
    }
  }, [date, workingHours, holidays]);

  const selectedService = services.find((s) => s.id === serviceId);

  const phoneDigits = phone.replace(/\D/g, "");
  const canSubmitForm =
    otpStage === "FORM" &&
    !!selectedService &&
    !!date &&
    !!time &&
    fullName.trim().length >= 3 &&
    email.includes("@") &&
    phoneDigits.length >= 10;

  const phoneVerificationRequired = settings?.phoneVerificationRequired ?? false;
  const recaptchaEnabled = settings?.recaptchaEnabled ?? false;
  const recaptchaSiteKey = settings?.recaptchaSiteKey || SITE_KEY;

  // ---------- reCAPTCHA TOKEN ÜRET ----------
  async function runRecaptcha(action: string) {
    if (!recaptchaEnabled || !recaptchaSiteKey) {
      return { ok: true };
    }

    if (!window.grecaptcha) {
      console.warn("reCAPTCHA henüz hazır değil, dev modda atlanıyor");
      return { ok: true };
    }

    try {
      const token = await new Promise<string>((resolve, reject) => {
        window.grecaptcha!.ready(async () => {
          try {
            const t = await window.grecaptcha!.execute(recaptchaSiteKey, {
              action,
            });
            resolve(t);
          } catch (e) {
            reject(e);
          }
        });
      });

      const verifyRes = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!verifyRes.ok) {
        const j = await verifyRes.json().catch(() => ({}));
        return { ok: false, error: j.error || "Bot koruması doğrulanamadı" };
      }

      return { ok: true };
    } catch (error: any) {
      return { ok: false, error: error.message || "reCAPTCHA hatası" };
    }
  }

  // ---------- 1) FORM SUBMIT -> OTP GÖNDER ----------
  async function handleCreateAppointment() {
    setMsg(null);

    // Bot kontrolü
    const captcha = await runRecaptcha("appointment_create");
    if (!captcha.ok) {
      setMsg(
        "⚠️ " +
          (captcha.error ||
            "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.")
      );
      return;
    }

    // Telefon doğrulama zorunlu değilse direkt randevu kaydet
    if (!phoneVerificationRequired) {
      await createAppointment();
      return;
    }

    // SMS doğrulama
    try {
      setSendingCode(true);

      const res = await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const json = await res.json();

      if (!res.ok) {
        setMsg("SMS gönderilemedi: " + (json.error || "Bilinmeyen hata"));
        setSendingCode(false);
        return;
      }

      setOtpStage("OTP");
      setMsg("📱 Doğrulama kodu telefonunuza gönderildi.");
    } catch (error: any) {
      setMsg("SMS hatası: " + error.message);
    } finally {
      setSendingCode(false);
    }
  }

  // ---------- 2) OTP DOĞRULAMA ----------
  async function handleVerifyOtp() {
    setMsg(null);

    if (otp.trim().length !== 6) {
      setMsg("Lütfen 6 haneli kodu girin.");
      return;
    }

    // Bot kontrolü (isteğe bağlı)
    const captcha = await runRecaptcha("otp_verify");
    if (!captcha.ok) {
      setMsg(
        "⚠️ " +
          (captcha.error ||
            "Güvenlik doğrulaması başarısız. Lütfen tekrar deneyin.")
      );
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otp }),
      });

      const json = await res.json();
      if (!res.ok) {
        setMsg(
          "❌ " +
            (json.error || "Doğrulama kodu hatalı veya süresi dolmuş.")
        );
        setSaving(false);
        return;
      }

      // SMS doğrulandı -> randevuyu kaydet
      await createAppointment();
    } catch (error: any) {
      setMsg("Hata: " + error.message);
      setSaving(false);
    }
  }

  // ---------- DB'YE RANDEVU KAYDI + BİLDİRİM ----------
  async function createAppointment() {
    setSaving(true);

    const { error } = await supabase.from("appointments").insert([
      {
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        date,
        time,
        message: note.trim() || null,
        status: "pending",
        service_id: serviceId || null,
      },
    ]);

    if (error) {
      setSaving(false);
      setMsg("Hata: " + error.message);
      return;
    }

    // Bildirim (mail + sms) – backend endpoint'i üzerinden
    try {
      await fetch("/api/send-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "appointment_confirmation",
          to: { email, phone, name: fullName.trim() },
          appointment: {
            date,
            time,
            service: selectedService?.title ?? "",
          },
        }),
      });
    } catch {
      // Bildirim hatası randevuyu bozmasın
    }

    setSaving(false);
    setOtpStage("DONE");
    setMsg("✅ Randevu talebiniz alındı.");
  }

  function resetForm() {
    setOtpStage("FORM");
    setOtp("");
    setFullName("");
    setEmail("");
    setPhone("");
    setNote("");
    setTime(null);
    setDate(todayISO());
    setMsg(null);
  }

  // ---------- RENDER ----------
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
              msg.startsWith("✅") || msg.includes("talebiniz alındı")
                ? "border-green-200 bg-green-50 text-green-800"
                : msg.startsWith("📱") || msg.startsWith("⚠️")
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {msg}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {/* LEFT: seçimler */}
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
                Bu tarihte uygun saat yok. Lütfen başka bir tarih seçin.
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
                        active ? "bg-slate-900 text-white" : "hover:bg-slate-50",
                        otpStage !== "FORM"
                          ? "cursor-not-allowed opacity-50"
                          : "",
                      ].join(" ")}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            )}

            {recaptchaEnabled && (
              <div className="mt-6 rounded-2xl border bg-blue-50 p-4 text-xs text-slate-700">
                🤖 <strong>Bot Koruması:</strong> Bu form Google reCAPTCHA v3
                ile korunmaktadır. Gizlilik Politikası ve Kullanım Şartları
                Google tarafından sağlanır.
              </div>
            )}
          </div>

          {/* RIGHT: özet + form */}
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

            <div className="mt-6 text-sm font-medium text-slate-700">
              Bilgileriniz
            </div>
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

            {/* FORM aşaması */}
            {otpStage === "FORM" && (
              <>
                <button
                  className={[
                    "mt-6 w-full rounded-2xl px-5 py-3 text-sm font-medium text-white transition",
                    canSubmitForm && !sendingCode
                      ? "bg-slate-900 hover:bg-slate-800"
                      : "cursor-not-allowed bg-slate-900/50",
                  ].join(" ")}
                  disabled={!canSubmitForm || sendingCode}
                  onClick={handleCreateAppointment}
                  type="button"
                >
                  {sendingCode ? "Kod gönderiliyor..." : "Randevu Oluştur"}
                </button>

                {phoneVerificationRequired && (
                  <p className="mt-2 text-xs text-slate-500">
                    Devam ettiğinizde SMS doğrulama adımına geçersiniz.
                  </p>
                )}
              </>
            )}

            {/* OTP aşaması */}
            {otpStage === "OTP" && (
              <div className="mt-6 rounded-3xl border bg-slate-50 p-5">
                <div className="text-sm font-medium">📱 SMS Doğrulama</div>
                <p className="mt-2 text-sm text-slate-700">
                  <strong>{phone}</strong> numarasına 6 haneli doğrulama kodu
                  gönderildi.
                </p>

                <div className="mt-4 grid gap-3">
                  <input
                    className="w-full rounded-2xl border px-4 py-3 text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, ""))
                    }
                  />

                  <button
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
                    onClick={handleVerifyOtp}
                    disabled={saving || otp.length !== 6}
                    type="button"
                  >
                    {saving ? "Kontrol ediliyor..." : "Kodu Doğrula"}
                  </button>

                  <button
                    className="rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-white"
                    onClick={() => {
                      setOtpStage("FORM");
                      setOtp("");
                    }}
                    type="button"
                  >
                    ← Geri dön
                  </button>
                </div>

                <p className="mt-3 text-xs text-slate-500">
                  Kod 5 dakika boyunca geçerlidir. Ulaşmazsa numaranızı kontrol
                  edip tekrar deneyebilirsiniz.
                </p>
              </div>
            )}

            {/* TAMAMLANDI */}
            {otpStage === "DONE" && (
              <div className="mt-6 rounded-3xl border bg-green-50 p-5">
                <div className="text-lg font-semibold text-green-900">
                  ✅ Randevu Talebiniz Alındı!
                </div>
                <p className="mt-2 text-sm text-slate-700">
                  Randevunuz başarıyla oluşturuldu. Onay ve detaylar kısa süre
                  içinde SMS ve e-posta ile iletilecektir.
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
                  type="button"
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
            <li>
              Randevu iptal/erteleme için en az 24 saat önceden bildirim
              yapılması rica edilir.
            </li>
            <li>
              Online seanslar Google Meet üzerinden gerçekleştirilir (link SMS
              veya e-posta ile gelir).
            </li>
            <li>
              İlk seans değerlendirme amaçlıdır, devam planı birlikte
              belirlenir.
            </li>
          </ul>
        </div>
      </section>
    </Container>
  );
}
