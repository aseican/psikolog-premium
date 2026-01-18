import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  const { phone, code } = await request.json();

  if (!phone || !code) {
    return NextResponse.json({ error: "Telefon ve kod gerekli" }, { status: 400 });
  }

  // Ayarları kontrol et
  const { data: settingsData } = await supabase.from("cms_blocks").select("data").eq("key", "settings").single();
  const settings = settingsData?.data;

  if (!settings?.phoneVerificationRequired) {
    return NextResponse.json({ success: true });
  }

  // Kodu kontrol et
  const { data, error } = await supabase
    .from("verification_codes")
    .select("*")
    .eq("phone", phone)
    .eq("code", code)
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Geçersiz veya süresi dolmuş kod" }, { status: 400 });
  }

  // Kodu doğrulanmış olarak işaretle
  await supabase.from("verification_codes").update({ verified: true }).eq("phone", phone);

  return NextResponse.json({ success: true });
}
