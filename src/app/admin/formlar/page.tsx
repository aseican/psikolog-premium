"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type FormSubmission = {
  id: string;
  form_type: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  data: any;
  created_at: string;
};

export default function AdminFormlarPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [filterType, setFilterType] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadSubmissions();
  }, []);

  async function loadSubmissions() {
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from("form_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setSubmissions(data ?? []);
    }

    setLoading(false);
  }

  async function deleteSubmission(id: string) {
    if (!confirm("Bu form gönderimini silmek istediğinize emin misiniz?")) return;

    const { error } = await supabase.from("form_submissions").delete().eq("id", id);

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setMsg("Silindi ✅");
      loadSubmissions();
    }
  }

  function openDetailModal(submission: FormSubmission) {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
  }

  // Filtering
  const filteredSubmissions = submissions.filter((sub) => {
    const matchesType = filterType === "all" || sub.form_type === filterType;
    const matchesSearch =
      searchTerm === "" ||
      sub.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.message?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Stats
  const stats = {
    total: submissions.length,
    contact: submissions.filter((s) => s.form_type === "contact").length,
    other: submissions.filter((s) => s.form_type !== "contact").length,
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Form Gönderileri</h1>
        <p className="mt-2 text-slate-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Form Gönderileri</h1>
        <p className="mt-2 text-slate-600">İletişim formu ve diğer form gönderimlerini yönetin</p>
      </div>

      {msg && (
        <div className="mb-4 rounded-2xl border bg-blue-50 px-4 py-3 text-sm text-slate-700">
          {msg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-600">Toplam</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border bg-blue-50 p-4">
          <p className="text-sm text-blue-800">İletişim</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">{stats.contact}</p>
        </div>
        <div className="rounded-2xl border bg-purple-50 p-4">
          <p className="text-sm text-purple-800">Diğer</p>
          <p className="mt-1 text-2xl font-bold text-purple-900">{stats.other}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="İsim, email veya mesaj ara..."
          className="flex-1 rounded-2xl border px-4 py-3 text-sm"
        />

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="rounded-2xl border bg-white px-4 py-3 text-sm sm:w-[200px]"
        >
          <option value="all">Tüm Formlar</option>
          <option value="contact">İletişim</option>
        </select>
      </div>

      {/* Submissions List */}
      <div className="space-y-3">
        {filteredSubmissions.length === 0 ? (
          <div className="rounded-3xl border bg-white/60 p-8 text-center">
            <p className="text-slate-600">
              {searchTerm || filterType !== "all" ? "Sonuç bulunamadı" : "Henüz form gönderimi yok"}
            </p>
          </div>
        ) : (
          filteredSubmissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-3xl border bg-white p-6 transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {sub.name || "Anonim"}
                      </h3>
                      <div className="mt-1 space-y-0.5 text-sm text-slate-600">
                        {sub.email && <p>📧 {sub.email}</p>}
                        {sub.phone && <p>📱 {sub.phone}</p>}
                        {sub.subject && (
                          <p className="font-medium text-slate-700">Konu: {sub.subject}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          📅 {new Date(sub.created_at).toLocaleString("tr-TR")}
                        </p>
                      </div>
                      {sub.message && (
                        <p className="mt-2 line-clamp-2 text-sm text-slate-700">
                          {sub.message}
                        </p>
                      )}
                    </div>

                    <span className="ml-4 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                      {sub.form_type}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openDetailModal(sub)}
                    className="rounded-xl border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    👁️ Detay
                  </button>

                  {sub.email && (
                    <a
                      href={`mailto:${sub.email}`}
                      className="rounded-xl border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      📧 Yanıtla
                    </a>
                  )}

                  <button
                    onClick={() => deleteSubmission(sub.id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                  >
                    🗑️ Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Form Detayı</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600">Form Türü</p>
                <span className="mt-1 inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                  {selectedSubmission.form_type}
                </span>
              </div>

              {selectedSubmission.name && (
                <div>
                  <p className="text-sm font-medium text-slate-600">İsim</p>
                  <p className="mt-1 text-slate-900">{selectedSubmission.name}</p>
                </div>
              )}

              {selectedSubmission.email && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Email</p>
                  <p className="mt-1 text-slate-900">{selectedSubmission.email}</p>
                </div>
              )}

              {selectedSubmission.phone && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Telefon</p>
                  <p className="mt-1 text-slate-900">{selectedSubmission.phone}</p>
                </div>
              )}

              {selectedSubmission.subject && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Konu</p>
                  <p className="mt-1 text-slate-900">{selectedSubmission.subject}</p>
                </div>
              )}

              {selectedSubmission.message && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Mesaj</p>
                  <p className="mt-1 whitespace-pre-wrap text-slate-900">
                    {selectedSubmission.message}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-600">Gönderilme Tarihi</p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(selectedSubmission.created_at).toLocaleString("tr-TR")}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 rounded-2xl border px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                Kapat
              </button>

              {selectedSubmission.email && (
                <a
                  href={`mailto:${selectedSubmission.email}`}
                  className="flex-1 rounded-2xl bg-slate-900 px-5 py-3 text-center text-sm font-medium text-white hover:bg-slate-800"
                >
                  📧 Yanıtla
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}