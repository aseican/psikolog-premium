"use client";

import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GirisPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin/hizmetler";

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || "Giriş başarısız");
        return;
      }

      router.replace(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container>
      <section className="mx-auto max-w-xl rounded-3xl border p-8">
        <h1 className="text-2xl font-semibold">Danışan Portalı</h1>
        <p className="mt-2 text-slate-700">
          Bu alan demo amaçlıdır. Yakında randevu takibi, iptal/erteleme ve bilgilendirme özellikleri eklenecektir.
        </p>

        <div className="mt-6 rounded-2xl border bg-slate-50 p-4 text-sm text-slate-700">
          Şimdilik randevu almak için <b>Randevu Al</b> sayfasını kullanabilirsiniz.
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/randevu"
            className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            Randevu Al
          </Link>

          <Link
            href="/iletisim"
            className="rounded-2xl border px-5 py-3 text-sm font-medium hover:bg-slate-50"
          >
            İletişim
          </Link>
        </div>

        {/* --- ADMIN GİRİŞİ (tasarıma dokunmadan, sade) --- */}
        <form onSubmit={handleAdminLogin} className="mt-10 border-t pt-6">
          <div className="text-sm font-medium text-slate-900">Admin Girişi</div>

          <input
            type="password"
            placeholder="Admin şifresi"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-3 w-full rounded-2xl border px-4 py-3 text-sm"
          />

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Admin Girişi"}
          </button>
        </form>
      </section>
    </Container>
  );
}
