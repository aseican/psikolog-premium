"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type QuizType = {
  id: string;
  name: string;
  description: string;
  icon: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
};

export default function AdminTestTurleriPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [types, setTypes] = useState<QuizType[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [editing, setEditing] = useState<QuizType | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("📋");
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    loadTypes();
  }, []);

  async function loadTypes() {
    setLoading(true);
    setMsg(null);

    const { data, error } = await supabase
      .from("quiz_types")
      .select("*")
      .order("order_index", { ascending: true });

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setTypes(data ?? []);
    }

    setLoading(false);
  }

  function openAddModal() {
    setEditing(null);
    setFormName("");
    setFormDescription("");
    setFormIcon("📋");
    setFormActive(true);
    setShowModal(true);
  }

  function openEditModal(type: QuizType) {
    setEditing(type);
    setFormName(type.name);
    setFormDescription(type.description);
    setFormIcon(type.icon);
    setFormActive(type.is_active);
    setShowModal(true);
  }

  async function handleSave() {
    if (!formName.trim()) {
      setMsg("İsim gerekli!");
      return;
    }

    setSaving(true);
    setMsg(null);

    const payload = {
      name: formName.trim(),
      description: formDescription.trim(),
      icon: formIcon,
      is_active: formActive,
      order_index: editing ? editing.order_index : types.length,
    };

    let error;

    if (editing) {
      ({ error } = await supabase.from("quiz_types").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("quiz_types").insert([payload]));
    }

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setMsg(editing ? "Güncellendi ✅" : "Eklendi ✅");
      setShowModal(false);
      loadTypes();
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu test türünü silmek istediğinize emin misiniz? İlişkili sorular da silinecek!")) return;

    setSaving(true);
    setMsg(null);

    const { error } = await supabase.from("quiz_types").delete().eq("id", id);

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setMsg("Silindi ✅");
      loadTypes();
    }

    setSaving(false);
  }

  async function toggleActive(id: string, currentStatus: boolean) {
    const { error } = await supabase
      .from("quiz_types")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      loadTypes();
    }
  }

  const iconOptions = ["📋", "🏥", "❤️", "🤝", "🧠", "💊", "🩺", "💬", "👨‍⚕️", "🌟"];

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Test Türleri</h1>
        <p className="mt-2 text-slate-600">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Test Türleri</h1>
          <p className="mt-2 text-slate-600">
            Test türlerini yönetin (Bireysel, Çift, Aile vb.)
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Yeni Tür Ekle
        </button>
      </div>

      {msg && (
        <div className="mt-4 rounded-2xl border bg-blue-50 px-4 py-3 text-sm text-slate-700">
          {msg}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {types.length === 0 ? (
          <div className="rounded-3xl border bg-white/60 p-8 text-center">
            <p className="text-slate-600">Henüz test türü eklenmemiş</p>
          </div>
        ) : (
          types.map((type) => (
            <div
              key={type.id}
              className="rounded-3xl border bg-white p-6 transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{type.icon}</div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{type.name}</h3>
                      <p className="mt-1 text-sm text-slate-600">{type.description}</p>
                    </div>

                    <button
                      onClick={() => toggleActive(type.id, type.is_active)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        type.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {type.is_active ? "Aktif" : "Pasif"}
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/testler/sorular/${type.id}`}
                      className="rounded-xl border bg-blue-50 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-100"
                    >
                      📝 Soruları Düzenle
                    </Link>

                    <Link
                      href={`/admin/testler/cevaplar/${type.id}`}
                      className="rounded-xl border bg-purple-50 px-3 py-1.5 text-sm text-purple-700 hover:bg-purple-100"
                    >
                      👁️ Cevapları Gör
                    </Link>

                    <button
                      onClick={() => openEditModal(type)}
                      className="rounded-xl border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      ✏️ Düzenle
                    </button>

                    <button
                      onClick={() => handleDelete(type.id)}
                      disabled={saving}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-3xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                {editing ? "Türü Düzenle" : "Yeni Tür Ekle"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-700">
                İsim *
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  placeholder="Örn: Bireysel Terapi"
                />
              </label>

              <label className="block text-sm text-slate-700">
                Açıklama
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  rows={3}
                  placeholder="Kısa açıklama..."
                />
              </label>

              <label className="block text-sm text-slate-700">
                İkon
                <div className="mt-2 flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormIcon(icon)}
                      className={`rounded-xl border p-3 text-2xl transition ${
                        formIcon === icon
                          ? "border-slate-900 bg-slate-100"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="h-5 w-5 rounded"
                />
                Aktif (Sitede göster)
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-2xl border px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}