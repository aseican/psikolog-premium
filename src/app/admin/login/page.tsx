"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin/hizmetler";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const r = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(data?.error || "Giriş başarısız");
        return;
      }

      router.replace(next);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] px-4 py-10 flex items-center justify-center">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-3xl border p-6">
        <h1 className="text-xl font-semibold text-slate-900">Admin Girişi</h1>

        <label className="mt-5 block text-sm text-slate-700">
          Kullanıcı adı
          <input
            className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </label>

        <label className="mt-4 block text-sm text-slate-700">
          Şifre
          <input
            className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </label>

        {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}

        <button
          disabled={loading}
          className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          type="submit"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş yap"}
        </button>
      </form>
    </div>
  );
}
