import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token gerekli" },
        { status: 400 }
      );
    }

    // Ayarları al
    const { data: settingsData } = await supabase
      .from("cms_blocks")
      .select("data")
      .eq("key", "settings")
      .single();

    const settings = settingsData?.data;

    // reCAPTCHA kapalıysa direkt geç
    if (!settings?.recaptchaEnabled) {
      return NextResponse.json({ success: true, score: 1 });
    }

    const secretKey = settings.recaptchaSecretKey;

    if (!secretKey) {
      return NextResponse.json(
        { success: false, error: "reCAPTCHA secret key eksik" },
        { status: 500 }
      );
    }

    // Google'a doğrulama isteği
    const params = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params.toString(),
      }
    );

    const result = await response.json();

    console.log("reCAPTCHA sonucu:", result);

    // Başarılı ve skor >= 0.5
    if (result.success && (result.score ?? 0) >= 0.5) {
      return NextResponse.json({ success: true, score: result.score });
    }

    return NextResponse.json(
      {
        success: false,
        score: result.score ?? 0,
        error: result["error-codes"]?.[0] || "Bot algılandı",
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("reCAPTCHA doğrulama hatası:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
