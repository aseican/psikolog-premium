import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { phone } = await request.json();

  if (!phone) {
    return NextResponse.json({ error: "Telefon numarası gerekli" }, { status: 400 });
  }

  // Ayarları al
  const { data: settingsData } = await supabase.from("cms_blocks").select("data").eq("key", "settings").single();
  const settings = settingsData?.data;

  if (!settings?.smsEnabled) {
    // SMS kapalıysa direkt başarılı dön (development için)
    return NextResponse.json({ success: true, message: "SMS devre dışı, doğrulama atlandı" });
  }

  // 6 haneli kod oluştur
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Kodu veritabanına kaydet (5 dk geçerli)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  
  await supabase.from("verification_codes").upsert(
    { phone, code, expires_at: expiresAt, verified: false },
    { onConflict: "phone" }
  );

  // SMS gönder
  try {
    if (settings.smsProvider === "netgsm") {
      await sendNetgsmSms(
        settings.netgsmUsercode,
        settings.netgsmPassword,
        settings.netgsmMsgHeader,
        phone,
        `Randevu doğrulama kodunuz: ${code}`
      );
    }

    return NextResponse.json({ success: true, message: "Doğrulama kodu gönderildi" });
  } catch (error: any) {
    console.error("SMS gönderme hatası:", error);
    return NextResponse.json({ error: "SMS gönderilemedi" }, { status: 500 });
  }
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

  // NetGSM başarı kodları: 00, 01, 02
  if (!text.startsWith("00") && !text.startsWith("01") && !text.startsWith("02")) {
    throw new Error(`NetGSM error: ${text}`);
  }

  return text;
}
