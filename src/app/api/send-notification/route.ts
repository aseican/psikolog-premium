import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type NotificationData = {
  type: "appointment_confirmation" | "appointment_reminder" | "appointment_cancelled";
  to: { email?: string; phone?: string; name: string };
  appointment: {
    date: string;
    time: string;
    service: string;
  };
};

export async function POST(request: NextRequest) {
  const data: NotificationData = await request.json();

  // Ayarları al
  const { data: settingsData } = await supabase.from("cms_blocks").select("data").eq("key", "settings").single();
  const settings = settingsData?.data;

  const results = { email: false, sms: false };

  // Email gönder
  if (settings?.emailEnabled && data.to.email) {
    try {
      const subject = getEmailSubject(data.type);
      const html = getEmailHtml(data);

      if (settings.emailProvider === "resend") {
        await sendResendEmail(settings.resendApiKey, {
          from: `${settings.emailFromName} <${settings.emailFrom}>`,
          to: data.to.email,
          subject,
          html,
        });
        results.email = true;
      }
    } catch (error) {
      console.error("Email gönderme hatası:", error);
    }
  }

  // SMS gönder
  if (settings?.smsEnabled && data.to.phone) {
    try {
      const message = getSmsMessage(data);

      if (settings.smsProvider === "netgsm") {
        await sendNetgsmSms(
          settings.netgsmUsercode,
          settings.netgsmPassword,
          settings.netgsmMsgHeader,
          data.to.phone,
          message
        );
        results.sms = true;
      }
    } catch (error) {
      console.error("SMS gönderme hatası:", error);
    }
  }

  return NextResponse.json({ success: true, results });
}

function getEmailSubject(type: NotificationData["type"]): string {
  switch (type) {
    case "appointment_confirmation":
      return "Randevunuz Onaylandı";
    case "appointment_reminder":
      return "Randevu Hatırlatması";
    case "appointment_cancelled":
      return "Randevunuz İptal Edildi";
    default:
      return "Randevu Bildirimi";
  }
}

function getEmailHtml(data: NotificationData): string {
  const { type, to, appointment } = data;

  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 40px 20px;
  `;

  const cardStyle = `
    background: #f8fafc;
    border-radius: 12px;
    padding: 24px;
    margin: 20px 0;
  `;

  let content = "";

  switch (type) {
    case "appointment_confirmation":
      content = `
        <h1 style="color: #0f172a; margin-bottom: 16px;">Randevunuz Onaylandı ✓</h1>
        <p style="color: #475569;">Sayın ${to.name},</p>
        <p style="color: #475569;">Randevunuz başarıyla oluşturuldu.</p>
        <div style="${cardStyle}">
          <p style="margin: 8px 0;"><strong>Tarih:</strong> ${appointment.date}</p>
          <p style="margin: 8px 0;"><strong>Saat:</strong> ${appointment.time}</p>
          <p style="margin: 8px 0;"><strong>Hizmet:</strong> ${appointment.service}</p>
        </div>
        <p style="color: #475569;">Görüşmek üzere!</p>
      `;
      break;

    case "appointment_reminder":
      content = `
        <h1 style="color: #0f172a; margin-bottom: 16px;">Randevu Hatırlatması 🔔</h1>
        <p style="color: #475569;">Sayın ${to.name},</p>
        <p style="color: #475569;">Yaklaşan randevunuzu hatırlatmak isteriz.</p>
        <div style="${cardStyle}">
          <p style="margin: 8px 0;"><strong>Tarih:</strong> ${appointment.date}</p>
          <p style="margin: 8px 0;"><strong>Saat:</strong> ${appointment.time}</p>
          <p style="margin: 8px 0;"><strong>Hizmet:</strong> ${appointment.service}</p>
        </div>
      `;
      break;

    case "appointment_cancelled":
      content = `
        <h1 style="color: #dc2626; margin-bottom: 16px;">Randevu İptal Edildi</h1>
        <p style="color: #475569;">Sayın ${to.name},</p>
        <p style="color: #475569;">Aşağıdaki randevunuz iptal edilmiştir.</p>
        <div style="${cardStyle}">
          <p style="margin: 8px 0;"><strong>Tarih:</strong> ${appointment.date}</p>
          <p style="margin: 8px 0;"><strong>Saat:</strong> ${appointment.time}</p>
          <p style="margin: 8px 0;"><strong>Hizmet:</strong> ${appointment.service}</p>
        </div>
        <p style="color: #475569;">Yeni randevu oluşturmak için sitemizi ziyaret edebilirsiniz.</p>
      `;
      break;
  }

  return `<div style="${baseStyle}">${content}</div>`;
}

function getSmsMessage(data: NotificationData): string {
  const { type, to, appointment } = data;

  switch (type) {
    case "appointment_confirmation":
      return `Sayin ${to.name}, ${appointment.date} ${appointment.time} tarihli randevunuz onaylandi.`;
    case "appointment_reminder":
      return `Sayin ${to.name}, yarin ${appointment.time} saatinde randevunuz bulunmaktadir. Gorusmek uzere!`;
    case "appointment_cancelled":
      return `Sayin ${to.name}, ${appointment.date} ${appointment.time} tarihli randevunuz iptal edilmistir.`;
    default:
      return "";
  }
}

async function sendResendEmail(apiKey: string, options: { from: string; to: string; subject: string; html: string }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(options),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend error: ${error}`);
  }

  return response.json();
}

async function sendNetgsmSms(usercode: string, password: string, msgheader: string, phone: string, message: string) {
  const cleanPhone = phone.replace(/\D/g, "").replace(/^0/, "90").replace(/^\+/, "");

  const params = new URLSearchParams({
    usercode,
    password,
    gsmno: cleanPhone,
    message,
    msgheader,
    dil: "TR",
  });

  const response = await fetch(`https://api.netgsm.com.tr/sms/send/get?${params}`);
  const text = await response.text();

  if (!text.startsWith("00") && !text.startsWith("01") && !text.startsWith("02")) {
    throw new Error(`NetGSM error: ${text}`);
  }

  return text;
}
