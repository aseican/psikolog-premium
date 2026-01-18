"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Appointment = {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  message: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  created_at: string;
};

const STATUS_LABELS = {
  pending: { label: "Bekliyor", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Onaylandı", color: "bg-green-100 text-green-800" },
  cancelled: { label: "İptal", color: "bg-red-100 text-red-800" },
  completed: { label: "Tamamlandı", color: "bg-blue-100 text-blue-800" },
};

export default function AdminRandevularPage() {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Detail modal
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("date", { ascending: false })
      .order("time", { ascending: true });

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setAppointments(data ?? []);
    }

    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: Appointment["status"]) {
    const { error } = await supabase
      .from("appointments")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setMsg(`Durum güncellendi: ${STATUS_LABELS[newStatus].label}`);
      loadAppointments();
    }
  }

  async function deleteAppointment(id: string) {
    if (!confirm("Bu randevuyu silmek istediğinize emin misiniz?")) return;

    const { error } = await supabase.from("appointments").delete().eq("id", id);

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setMsg("Randevu silindi ✅");
      loadAppointments();
    }
  }

  function openDetailModal(appointment: Appointment) {
    setSelectedAppointment(appointment);
    setShowDetailModal(true);
  }

  // Filtering
  const filteredAppointments = appointments.filter((apt) => {
    const matchesStatus = filterStatus === "all" || apt.status === filterStatus;
    const matchesSearch =
      searchTerm === "" ||
      apt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.phone?.includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Stats
  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "pending").length,
    confirmed: appointments.filter((a) => a.status === "confirmed").length,
    cancelled: appointments.filter((a) => a.status === "cancelled").length,
    completed: appointments.filter((a) => a.status === "completed").length,
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Randevu Yönetimi</h1>
        <p className="mt-2 text-slate-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">Randevu Yönetimi</h1>
        <p className="mt-2 text-slate-600">Gelen randevu taleplerini yönetin</p>
      </div>

      {msg && (
        <div className="mb-4 rounded-2xl border bg-blue-50 px-4 py-3 text-sm text-slate-700">
          {msg}
        </div>
      )}

      {/* Stats Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border bg-white p-4">
          <p className="text-sm text-slate-600">Toplam</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">Bekliyor</p>
          <p className="mt-1 text-2xl font-bold text-yellow-900">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border bg-green-50 p-4">
          <p className="text-sm text-green-800">Onaylandı</p>
          <p className="mt-1 text-2xl font-bold text-green-900">{stats.confirmed}</p>
        </div>
        <div className="rounded-2xl border bg-blue-50 p-4">
          <p className="text-sm text-blue-800">Tamamlandı</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">{stats.completed}</p>
        </div>
        <div className="rounded-2xl border bg-red-50 p-4">
          <p className="text-sm text-red-800">İptal</p>
          <p className="mt-1 text-2xl font-bold text-red-900">{stats.cancelled}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="İsim, email veya telefon ara..."
          className="flex-1 rounded-2xl border px-4 py-3 text-sm"
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-2xl border bg-white px-4 py-3 text-sm sm:w-[200px]"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Bekliyor</option>
          <option value="confirmed">Onaylandı</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal</option>
        </select>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="rounded-3xl border bg-white/60 p-8 text-center">
            <p className="text-slate-600">
              {searchTerm || filterStatus !== "all"
                ? "Sonuç bulunamadı"
                : "Henüz randevu yok"}
            </p>
          </div>
        ) : (
          filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="rounded-3xl border bg-white p-6 transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{apt.name}</h3>
                      <div className="mt-1 space-y-0.5 text-sm text-slate-600">
                        <p>📧 {apt.email}</p>
                        {apt.phone && <p>📱 {apt.phone}</p>}
                        <p>
                          📅{" "}
                          {new Date(apt.date).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          • ⏰ {apt.time}
                        </p>
                      </div>
                      {apt.message && (
                        <p className="mt-2 text-sm italic text-slate-500">"{apt.message}"</p>
                      )}
                    </div>

                    <span
                      className={`ml-4 rounded-full px-3 py-1 text-xs font-medium ${
                        STATUS_LABELS[apt.status].color
                      }`}
                    >
                      {STATUS_LABELS[apt.status].label}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {apt.status === "pending" && (
                    <>
                      <button
                        onClick={() => updateStatus(apt.id, "confirmed")}
                        className="rounded-xl border border-green-200 bg-green-50 px-3 py-1.5 text-sm text-green-700 hover:bg-green-100"
                      >
                        ✓ Onayla
                      </button>
                      <button
                        onClick={() => updateStatus(apt.id, "cancelled")}
                        className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                      >
                        ✕ İptal
                      </button>
                    </>
                  )}

                  {apt.status === "confirmed" && (
                    <button
                      onClick={() => updateStatus(apt.id, "completed")}
                      className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                    >
                      ✓ Tamamlandı
                    </button>
                  )}

                  <button
                    onClick={() => openDetailModal(apt)}
                    className="rounded-xl border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    👁️ Detay
                  </button>

                  <button
                    onClick={() => deleteAppointment(apt.id)}
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Randevu Detayı</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-600">Durum</p>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-1 text-sm font-medium ${
                    STATUS_LABELS[selectedAppointment.status].color
                  }`}
                >
                  {STATUS_LABELS[selectedAppointment.status].label}
                </span>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600">İsim</p>
                <p className="mt-1 text-slate-900">{selectedAppointment.name}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-600">Email</p>
                <p className="mt-1 text-slate-900">{selectedAppointment.email}</p>
              </div>

              {selectedAppointment.phone && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Telefon</p>
                  <p className="mt-1 text-slate-900">{selectedAppointment.phone}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-600">Tarih ve Saat</p>
                <p className="mt-1 text-slate-900">
                  {new Date(selectedAppointment.date).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  • {selectedAppointment.time}
                </p>
              </div>

              {selectedAppointment.message && (
                <div>
                  <p className="text-sm font-medium text-slate-600">Mesaj</p>
                  <p className="mt-1 text-slate-900">{selectedAppointment.message}</p>
                </div>
              )}

              <div>
                <p className="text-sm font-medium text-slate-600">Oluşturulma</p>
                <p className="mt-1 text-sm text-slate-600">
                  {new Date(selectedAppointment.created_at).toLocaleString("tr-TR")}
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

              {selectedAppointment.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      updateStatus(selectedAppointment.id, "confirmed");
                      setShowDetailModal(false);
                    }}
                    className="flex-1 rounded-2xl bg-green-600 px-5 py-3 text-sm font-medium text-white hover:bg-green-700"
                  >
                    Onayla
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}