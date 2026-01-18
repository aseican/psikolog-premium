"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Stats = {
  appointments: number;
  pendingAppointments: number;
  forms: number;
  quizResults: number;
  services: number;
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    appointments: 0,
    pendingAppointments: 0,
    forms: 0,
    quizResults: 0,
    services: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);

    const [
      { count: appointmentsCount },
      { count: pendingCount },
      { count: formsCount },
      { count: quizCount },
      { count: servicesCount },
    ] = await Promise.all([
      supabase.from("appointments").select("*", { count: "exact", head: true }),
      supabase.from("appointments").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("form_submissions").select("*", { count: "exact", head: true }),
      supabase.from("quiz_results").select("*", { count: "exact", head: true }),
      supabase.from("services").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      appointments: appointmentsCount ?? 0,
      pendingAppointments: pendingCount ?? 0,
      forms: formsCount ?? 0,
      quizResults: quizCount ?? 0,
      services: servicesCount ?? 0,
    });

    setLoading(false);
  }

  const cards = [
    {
      title: "Randevular",
      value: stats.appointments,
      subtitle: `${stats.pendingAppointments} bekliyor`,
      href: "/admin/randevular",
      color: "bg-blue-500",
    },
    {
      title: "Form Gönderileri",
      value: stats.forms,
      subtitle: "Toplam gönderim",
      href: "/admin/formlar",
      color: "bg-green-500",
    },
    {
      title: "Test Sonuçları",
      value: stats.quizResults,
      subtitle: "Tamamlanan test",
      href: "/admin/testler",
      color: "bg-purple-500",
    },
    {
      title: "Hizmetler",
      value: stats.services,
      subtitle: "Aktif hizmet",
      href: "/admin/hizmetler",
      color: "bg-orange-500",
    },
  ];

  const quickLinks = [
    { label: "İçerik Yönetimi", href: "/admin/icerik", icon: "📝" },
    { label: "Hizmetler", href: "/admin/hizmetler", icon: "🏥" },
    { label: "Randevular", href: "/admin/randevular", icon: "📅" },
    { label: "Formlar", href: "/admin/formlar", icon: "📋" },
    { label: "Testler", href: "/admin/testler", icon: "🎯" },
    { label: "Ayarlar", href: "/admin/ayarlar", icon: "⚙️" },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Site yönetim panelinize hoş geldiniz</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group rounded-3xl border bg-white p-6 transition hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
                <p className="mt-1 text-xs text-slate-500">{card.subtitle}</p>
              </div>
              <div className={`rounded-2xl ${card.color} p-3 text-white opacity-80 transition group-hover:opacity-100`}>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="rounded-3xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Hızlı Erişim</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-2xl border bg-slate-50/50 p-4 transition hover:bg-slate-100/50"
            >
              <span className="text-2xl">{link.icon}</span>
              <span className="text-sm font-medium text-slate-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity Preview */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Son Randevular</h2>
          <RecentAppointments />
        </div>

        <div className="rounded-3xl border bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Son Form Gönderileri</h2>
          <RecentForms />
        </div>
      </div>
    </div>
  );
}

function RecentAppointments() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setItems(data ?? []);
    setLoading(false);
  }

  if (loading) return <p className="mt-4 text-sm text-slate-500">Yükleniyor...</p>;
  if (!items.length) return <p className="mt-4 text-sm text-slate-500">Henüz randevu yok</p>;

  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border bg-slate-50/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{item.name}</p>
              <p className="text-xs text-slate-500">{item.email}</p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-medium ${
                item.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : item.status === "confirmed"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentForms() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await supabase
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);
    setItems(data ?? []);
    setLoading(false);
  }

  if (loading) return <p className="mt-4 text-sm text-slate-500">Yükleniyor...</p>;
  if (!items.length) return <p className="mt-4 text-sm text-slate-500">Henüz form gönderimi yok</p>;

  return (
    <div className="mt-4 space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-2xl border bg-slate-50/50 p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-900">{item.name || "Anonim"}</p>
              <p className="text-xs text-slate-500">{item.form_type}</p>
            </div>
            <p className="text-xs text-slate-400">
              {new Date(item.created_at).toLocaleDateString("tr-TR")}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}