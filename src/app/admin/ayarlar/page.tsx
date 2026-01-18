"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Settings = {
  // Genel
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  
  // reCAPTCHA
  recaptchaEnabled: boolean;
  recaptchaSiteKey: string;
  recaptchaSecretKey: string;
  
  // SMS (Netgsm)
  smsEnabled: boolean;
  smsProvider: "netgsm" | "twilio";
  netgsmUsercode: string;
  netgsmPassword: string;
  netgsmMsgHeader: string;
  
  // Email (Resend veya SMTP)
  emailEnabled: boolean;
  emailProvider: "resend" | "smtp";
  resendApiKey: string;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;
  emailFromName: string;
  
  // Randevu Ayarları
  appointmentReminderHours: number;
  appointmentConfirmationRequired: boolean;
  phoneVerificationRequired: boolean;
  
  // Çalışma Saatleri
  workingHours: {
    [key: string]: { start: string; end: string; enabled: boolean };
  };
  
  // Tatil Günleri
  holidays: string[];
};

const DEFAULT_SETTINGS: Settings = {
  siteName: "Psikolog Eda Keklik Akalp",
  siteUrl: "",
  adminEmail: "",
  
  recaptchaEnabled: false,
  recaptchaSiteKey: "",
  recaptchaSecretKey: "",
  
  smsEnabled: false,
  smsProvider: "netgsm",
  netgsmUsercode: "",
  netgsmPassword: "",
  netgsmMsgHeader: "",
  
  emailEnabled: false,
  emailProvider: "resend",
  resendApiKey: "",
  smtpHost: "",
  smtpPort: "587",
  smtpUser: "",
  smtpPassword: "",
  emailFrom: "",
  emailFromName: "",
  
  appointmentReminderHours: 24,
  appointmentConfirmationRequired: true,
  phoneVerificationRequired: true,
  
  workingHours: {
    monday: { start: "09:00", end: "18:00", enabled: true },
    tuesday: { start: "09:00", end: "18:00", enabled: true },
    wednesday: { start: "09:00", end: "18:00", enabled: true },
    thursday: { start: "09:00", end: "18:00", enabled: true },
    friday: { start: "09:00", end: "18:00", enabled: true },
    saturday: { start: "10:00", end: "14:00", enabled: false },
    sunday: { start: "10:00", end: "14:00", enabled: false },
  },
  
  holidays: [],
};

const DAYS = [
  { key: "monday", label: "Pazartesi" },
  { key: "tuesday", label: "Salı" },
  { key: "wednesday", label: "Çarşamba" },
  { key: "thursday", label: "Perşembe" },
  { key: "friday", label: "Cuma" },
  { key: "saturday", label: "Cumartesi" },
  { key: "sunday", label: "Pazar" },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"genel" | "guvenlik" | "sms" | "email" | "randevu" | "calisma">("genel");
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [newHoliday, setNewHoliday] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    const { data } = await supabase.from("cms_blocks").select("data").eq("key", "settings").single();
    if (data?.data) {
      setSettings({ ...DEFAULT_SETTINGS, ...data.data });
    }
    setLoading(false);
  }

  async function saveSettings() {
    setSaving(true);
    const { error } = await supabase.from("cms_blocks").upsert({ key: "settings", data: settings }, { onConflict: "key" });
    setMessage({ type: error ? "error" : "success", text: error?.message ?? "Ayarlar kaydedildi!" });
    setTimeout(() => setMessage(null), 3000);
    setSaving(false);
  }

  function updateSettings(partial: Partial<Settings>) {
    setSettings((prev) => ({ ...prev, ...partial }));
  }

  function updateWorkingHours(day: string, field: string, value: any) {
    setSettings((prev) => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...prev.workingHours[day], [field]: value },
      },
    }));
  }

  function addHoliday() {
    if (!newHoliday) return;
    setSettings((prev) => ({ ...prev, holidays: [...prev.holidays, newHoliday] }));
    setNewHoliday("");
  }

  function removeHoliday(date: string) {
    setSettings((prev) => ({ ...prev, holidays: prev.holidays.filter((h) => h !== date) }));
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-900" />
      </div>
    );
  }

  const tabs = [
    { id: "genel", label: "Genel", icon: "⚙️" },
    { id: "guvenlik", label: "Güvenlik (Bot)", icon: "🛡️" },
    { id: "sms", label: "SMS", icon: "📱" },
    { id: "email", label: "E-posta", icon: "📧" },
    { id: "randevu", label: "Randevu", icon: "📅" },
    { id: "calisma", label: "Çalışma Saatleri", icon: "🕐" },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-semibold text-slate-900">Ayarlar</h1>
          <div className="flex items-center gap-3">
            {message && (
              <span className={`rounded-lg px-3 py-1 text-sm ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message.text}
              </span>
            )}
            <button onClick={saveSettings} disabled={saving} className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50">
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="flex gap-6">
          {/* Tabs */}
          <aside className="w-48 shrink-0">
            <nav className="sticky top-20 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm transition ${
                    activeTab === tab.id ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content */}
          <main className="flex-1">
            {/* GENEL */}
            {activeTab === "genel" && (
              <Card title="Genel Ayarlar">
                <div className="grid gap-4">
                  <Input label="Site Adı" value={settings.siteName} onChange={(v) => updateSettings({ siteName: v })} />
                  <Input label="Site URL" value={settings.siteUrl} onChange={(v) => updateSettings({ siteUrl: v })} placeholder="https://example.com" />
                  <Input label="Admin E-posta" value={settings.adminEmail} onChange={(v) => updateSettings({ adminEmail: v })} placeholder="admin@example.com" />
                </div>
              </Card>
            )}

            {/* GÜVENLİK (reCAPTCHA) */}
            {activeTab === "guvenlik" && (
              <Card title="Bot Koruması (reCAPTCHA v3)">
                <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                  <p className="font-medium">Google reCAPTCHA v3 Kurulumu:</p>
                  <ol className="mt-2 list-inside list-decimal space-y-1">
                    <li>
                      <a href="https://www.google.com/recaptcha/admin" target="_blank" rel="noopener" className="underline">
                        Google reCAPTCHA Admin
                      </a>{" "}
                      sayfasına gidin
                    </li>
                    <li>reCAPTCHA v3 seçin ve sitenizi ekleyin</li>
                    <li>Site Key ve Secret Key'i aşağıya yapıştırın</li>
                  </ol>
                </div>

                <Toggle label="reCAPTCHA Aktif" checked={settings.recaptchaEnabled} onChange={(v) => updateSettings({ recaptchaEnabled: v })} />

                {settings.recaptchaEnabled && (
                  <div className="mt-4 grid gap-4">
                    <Input label="Site Key (Public)" value={settings.recaptchaSiteKey} onChange={(v) => updateSettings({ recaptchaSiteKey: v })} placeholder="6Lc..." />
                    <Input label="Secret Key (Private)" value={settings.recaptchaSecretKey} onChange={(v) => updateSettings({ recaptchaSecretKey: v })} placeholder="6Lc..." type="password" />
                  </div>
                )}
              </Card>
            )}

            {/* SMS */}
            {activeTab === "sms" && (
              <Card title="SMS Ayarları">
                <div className="mb-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">NetGSM Kurulumu:</p>
                  <ol className="mt-2 list-inside list-decimal space-y-1">
                    <li>
                      <a href="https://www.netgsm.com.tr" target="_blank" rel="noopener" className="underline">
                        NetGSM
                      </a>{" "}
                      hesabı oluşturun
                    </li>
                    <li>SMS paketi satın alın</li>
                    <li>Kullanıcı kodu, şifre ve başlık bilgilerini girin</li>
                  </ol>
                </div>

                <Toggle label="SMS Bildirimleri Aktif" checked={settings.smsEnabled} onChange={(v) => updateSettings({ smsEnabled: v })} />

                {settings.smsEnabled && (
                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">SMS Sağlayıcı</label>
                      <select
                        value={settings.smsProvider}
                        onChange={(e) => updateSettings({ smsProvider: e.target.value as any })}
                        className="w-full rounded-lg border px-4 py-2.5 text-sm"
                      >
                        <option value="netgsm">NetGSM</option>
                        <option value="twilio">Twilio</option>
                      </select>
                    </div>

                    {settings.smsProvider === "netgsm" && (
                      <>
                        <Input label="Kullanıcı Kodu" value={settings.netgsmUsercode} onChange={(v) => updateSettings({ netgsmUsercode: v })} />
                        <Input label="Şifre" value={settings.netgsmPassword} onChange={(v) => updateSettings({ netgsmPassword: v })} type="password" />
                        <Input label="Mesaj Başlığı" value={settings.netgsmMsgHeader} onChange={(v) => updateSettings({ netgsmMsgHeader: v })} placeholder="FIRMAADI" />
                      </>
                    )}
                  </div>
                )}
              </Card>
            )}

            {/* EMAIL */}
            {activeTab === "email" && (
              <Card title="E-posta Ayarları">
                <div className="mb-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
                  <p className="font-medium">Önerilen: Resend</p>
                  <p className="mt-1">
                    <a href="https://resend.com" target="_blank" rel="noopener" className="underline">
                      Resend.com
                    </a>{" "}
                    ücretsiz plan ile ayda 3000 mail gönderebilirsiniz. API key oluşturup aşağıya yapıştırın.
                  </p>
                </div>

                <Toggle label="E-posta Bildirimleri Aktif" checked={settings.emailEnabled} onChange={(v) => updateSettings({ emailEnabled: v })} />

                {settings.emailEnabled && (
                  <div className="mt-4 grid gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">E-posta Sağlayıcı</label>
                      <select
                        value={settings.emailProvider}
                        onChange={(e) => updateSettings({ emailProvider: e.target.value as any })}
                        className="w-full rounded-lg border px-4 py-2.5 text-sm"
                      >
                        <option value="resend">Resend</option>
                        <option value="smtp">SMTP</option>
                      </select>
                    </div>

                    {settings.emailProvider === "resend" && (
                      <Input label="Resend API Key" value={settings.resendApiKey} onChange={(v) => updateSettings({ resendApiKey: v })} placeholder="re_..." type="password" />
                    )}

                    {settings.emailProvider === "smtp" && (
                      <>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input label="SMTP Host" value={settings.smtpHost} onChange={(v) => updateSettings({ smtpHost: v })} placeholder="smtp.gmail.com" />
                          <Input label="SMTP Port" value={settings.smtpPort} onChange={(v) => updateSettings({ smtpPort: v })} placeholder="587" />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input label="SMTP Kullanıcı" value={settings.smtpUser} onChange={(v) => updateSettings({ smtpUser: v })} />
                          <Input label="SMTP Şifre" value={settings.smtpPassword} onChange={(v) => updateSettings({ smtpPassword: v })} type="password" />
                        </div>
                      </>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input label="Gönderen E-posta" value={settings.emailFrom} onChange={(v) => updateSettings({ emailFrom: v })} placeholder="noreply@example.com" />
                      <Input label="Gönderen Adı" value={settings.emailFromName} onChange={(v) => updateSettings({ emailFromName: v })} placeholder="Psikolog Eda Keklik" />
                    </div>
                  </div>
                )}
              </Card>
            )}

            {/* RANDEVU */}
            {activeTab === "randevu" && (
              <Card title="Randevu Ayarları">
                <div className="grid gap-4">
                  <Toggle
                    label="Telefon Doğrulaması Zorunlu"
                    description="Randevu oluşturmadan önce SMS ile telefon doğrulaması yapılır"
                    checked={settings.phoneVerificationRequired}
                    onChange={(v) => updateSettings({ phoneVerificationRequired: v })}
                  />

                  <Toggle
                    label="Randevu Onayı Gerekli"
                    description="Randevular otomatik onaylanmaz, admin onayı bekler"
                    checked={settings.appointmentConfirmationRequired}
                    onChange={(v) => updateSettings({ appointmentConfirmationRequired: v })}
                  />

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Hatırlatma Süresi (saat önce)</label>
                    <input
                      type="number"
                      value={settings.appointmentReminderHours}
                      onChange={(e) => updateSettings({ appointmentReminderHours: parseInt(e.target.value) || 24 })}
                      className="w-32 rounded-lg border px-4 py-2.5 text-sm"
                      min="1"
                      max="72"
                    />
                    <p className="mt-1 text-xs text-slate-500">Randevudan kaç saat önce hatırlatma gönderilsin?</p>
                  </div>
                </div>
              </Card>
            )}

            {/* ÇALIŞMA SAATLERİ */}
            {activeTab === "calisma" && (
              <>
                <Card title="Çalışma Saatleri">
                  <div className="space-y-3">
                    {DAYS.map((day) => (
                      <div key={day.key} className="flex items-center gap-4 rounded-lg border bg-white p-3">
                        <label className="flex w-28 items-center gap-2">
                          <input
                            type="checkbox"
                            checked={settings.workingHours[day.key]?.enabled ?? false}
                            onChange={(e) => updateWorkingHours(day.key, "enabled", e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-slate-700">{day.label}</span>
                        </label>

                        {settings.workingHours[day.key]?.enabled && (
                          <div className="flex items-center gap-2">
                            <input
                              type="time"
                              value={settings.workingHours[day.key]?.start ?? "09:00"}
                              onChange={(e) => updateWorkingHours(day.key, "start", e.target.value)}
                              className="rounded-lg border px-3 py-2 text-sm"
                            />
                            <span className="text-slate-500">-</span>
                            <input
                              type="time"
                              value={settings.workingHours[day.key]?.end ?? "18:00"}
                              onChange={(e) => updateWorkingHours(day.key, "end", e.target.value)}
                              className="rounded-lg border px-3 py-2 text-sm"
                            />
                          </div>
                        )}

                        {!settings.workingHours[day.key]?.enabled && <span className="text-sm text-slate-400">Kapalı</span>}
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Tatil Günleri" className="mt-6">
                  <div className="flex gap-3">
                    <input
                      type="date"
                      value={newHoliday}
                      onChange={(e) => setNewHoliday(e.target.value)}
                      className="rounded-lg border px-4 py-2 text-sm"
                    />
                    <button onClick={addHoliday} className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white">
                      Ekle
                    </button>
                  </div>

                  {settings.holidays.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {settings.holidays.sort().map((date) => (
                        <span key={date} className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm">
                          {new Date(date).toLocaleDateString("tr-TR")}
                          <button onClick={() => removeHoliday(date)} className="text-red-500 hover:text-red-700">
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Sub Components
function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border bg-white p-6 ${className}`}>
      <h2 className="mb-6 text-lg font-semibold text-slate-900">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border px-4 py-2.5 text-sm focus:border-slate-400 focus:outline-none"
      />
    </div>
  );
}

function Toggle({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <div className="relative mt-0.5">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
        <div className={`h-6 w-11 rounded-full transition ${checked ? "bg-slate-900" : "bg-slate-200"}`} />
        <div className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${checked ? "translate-x-5" : ""}`} />
      </div>
      <div>
        <div className="text-sm font-medium text-slate-700">{label}</div>
        {description && <p className="text-xs text-slate-500">{description}</p>}
      </div>
    </label>
  );
}
