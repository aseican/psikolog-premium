import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("cms_blocks")
      .select("data")
      .eq("key", "settings")
      .single();

    if (error) {
      console.error("Settings yüklenemedi:", error);
      return NextResponse.json({
        recaptchaEnabled: false,
        recaptchaSiteKey: "",
        phoneVerificationRequired: false,
      });
    }

    const settings = data?.data || {};

    return NextResponse.json({
      recaptchaEnabled: settings.recaptchaEnabled ?? false,
      recaptchaSiteKey: settings.recaptchaSiteKey ?? "",
      phoneVerificationRequired: settings.phoneVerificationRequired ?? false,
    });
  } catch (err) {
    console.error("Settings error:", err);
    return NextResponse.json({
      recaptchaEnabled: false,
      recaptchaSiteKey: "",
      phoneVerificationRequired: false,
    });
  }
}
