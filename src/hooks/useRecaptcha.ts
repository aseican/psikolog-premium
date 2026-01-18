"use client";

import { useEffect, useState, useCallback } from "react";

export function useRecaptcha() {
  const [isReady, setIsReady] = useState(false);
  const [siteKey, setSiteKey] = useState<string | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((settings) => {
        setIsEnabled(settings.recaptchaEnabled);
        if (settings.recaptchaEnabled && settings.recaptchaSiteKey) {
          setSiteKey(settings.recaptchaSiteKey);
          loadRecaptchaScript(settings.recaptchaSiteKey);
        } else {
          setIsReady(true);
        }
      })
      .catch(() => setIsReady(true));
  }, []);

  const loadRecaptchaScript = (key: string) => {
    if (document.getElementById("recaptcha-script")) {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setIsReady(true));
      }
      return;
    }

    window.onRecaptchaLoad = () => {
      if (window.grecaptcha) {
        window.grecaptcha.ready(() => setIsReady(true));
      }
    };

    const script = document.createElement("script");
    script.id = "recaptcha-script";
    script.src = `https://www.google.com/recaptcha/api.js?render=${key}&onload=onRecaptchaLoad`;
    script.async = true;
    document.head.appendChild(script);
  };

  const executeRecaptcha = useCallback(
    async (action: string = "submit"): Promise<{ success: boolean; error?: string }> => {
      if (!isEnabled) return { success: true };

      if (!isReady || !siteKey || !window.grecaptcha) {
        return { success: false, error: "reCAPTCHA henüz yüklenmedi" };
      }

      try {
        const token = await window.grecaptcha.execute(siteKey, { action });

        const response = await fetch("/api/verify-recaptcha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (data.success) return { success: true };

        return { success: false, error: data.error || "Doğrulama başarısız" };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Bilinmeyen hata";
        return { success: false, error: message };
      }
    },
    [isReady, siteKey, isEnabled]
  );

  return { isReady: isReady || !isEnabled, executeRecaptcha, isEnabled };
}
