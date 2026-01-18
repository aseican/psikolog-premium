"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";

type Question = {
  id: string;
  quiz_type_id: string;
  question: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
};

type QuizType = {
  id: string;
  name: string;
  icon: string;
};

export default function AdminQuizQuestionsPage() {
  const params = useParams();
  const typeId = params.typeId as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [editing, setEditing] = useState<Question | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [formQuestion, setFormQuestion] = useState("");
  const [formActive, setFormActive] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeId]);

  async function loadData() {
    setLoading(true);
    setMsg(null);

    const [typeRes, questionsRes] = await Promise.all([
      supabase.from("quiz_types").select("id, name, icon").eq("id", typeId).single(),
      supabase
        .from("quiz_questions")
        .select("*")
        .eq("quiz_type_id", typeId)
        .order("order_index", { ascending: true }),
    ]);

    if (typeRes.error) {
      setMsg("Test türü bulunamadı: " + typeRes.error.message);
    } else {
      setQuizType(typeRes.data);
    }

    if (questionsRes.error) {
      setMsg("Hata: " + questionsRes.error.message);
    } else {
      setQuestions(questionsRes.data ?? []);
    }

    setLoading(false);
  }

  function openAddModal() {
    setEditing(null);
    setFormQuestion("");
    setFormActive(true);
    setShowModal(true);
  }

  function openEditModal(q: Question) {
    setEditing(q);
    setFormQuestion(q.question);
    setFormActive(q.is_active);
    setShowModal(true);
  }

  async function handleSave() {
    if (!formQuestion.trim()) {
      setMsg("Soru metni gerekli!");
      return;
    }

    setSaving(true);
    setMsg(null);

    const payload = {
      quiz_type_id: typeId,
      question: formQuestion.trim(),
      is_active: formActive,
      order_index: editing ? editing.order_index : questions.length,
    };

    let error;

    if (editing) {
      ({ error } = await supabase.from("quiz_questions").update(payload).eq("id", editing.id));
    } else {
      ({ error } = await supabase.from("quiz_questions").insert([payload]));
    }

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setMsg(editing ? "Güncellendi ✅" : "Eklendi ✅");
      setShowModal(false);
      loadData();
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;

    setSaving(true);
    setMsg(null);

    const { error } = await supabase.from("quiz_questions").delete().eq("id", id);

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setMsg("Silindi ✅");
      loadData();
    }

    setSaving(false);
  }

  async function moveQuestion(id: string, direction: "up" | "down") {
    const index = questions.findIndex((q) => q.id === id);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === questions.length - 1)
    ) {
      return;
    }

    const newQuestions = [...questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    const updates = newQuestions.map((q, i) => ({ id: q.id, order_index: i }));

    for (const update of updates) {
      await supabase
        .from("quiz_questions")
        .update({ order_index: update.order_index })
        .eq("id", update.id);
    }

    loadData();
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Sorular</h1>
        <p className="mt-2 text-slate-600">Yükleniyor...</p>
      </div>
    );
  }

  if (!quizType) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <p className="text-red-600">Test türü bulunamadı</p>
        <Link href="/admin/testler" className="mt-4 text-sm text-blue-600 hover:underline">
          ← Test türlerine dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/admin/testler"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
        >
          ← Test Türlerine Dön
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            {quizType.icon} {quizType.name} - Sorular
          </h1>
          <p className="mt-2 text-slate-600">Bu test türüne ait soruları yönetin</p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
        >
          + Yeni Soru Ekle
        </button>
      </div>

      {msg && (
        <div className="mt-4 rounded-2xl border bg-blue-50 px-4 py-3 text-sm text-slate-700">
          {msg}
        </div>
      )}

      <div className="mt-6 space-y-3">
        {questions.length === 0 ? (
          <div className="rounded-3xl border bg-white/60 p-8 text-center">
            <p className="text-slate-600">Henüz soru eklenmemiş</p>
          </div>
        ) : (
          questions.map((q, index) => (
            <div
              key={q.id}
              className="rounded-3xl border bg-white p-6 transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-medium text-slate-700">
                  {index + 1}
                </div>

                <div className="flex-1">
                  <p className="text-slate-900">{q.question}</p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditModal(q)}
                      className="rounded-xl border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      ✏️ Düzenle
                    </button>

                    <button
                      onClick={() => handleDelete(q.id)}
                      disabled={saving}
                      className="rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-700 hover:bg-red-100"
                    >
                      🗑️ Sil
                    </button>

                    {index > 0 && (
                      <button
                        onClick={() => moveQuestion(q.id, "up")}
                        className="rounded-xl border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        ⬆️
                      </button>
                    )}

                    {index < questions.length - 1 && (
                      <button
                        onClick={() => moveQuestion(q.id, "down")}
                        className="rounded-xl border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                      >
                        ⬇️
                      </button>
                    )}
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
                {editing ? "Soruyu Düzenle" : "Yeni Soru Ekle"}
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
                Soru Metni *
                <textarea
                  value={formQuestion}
                  onChange={(e) => setFormQuestion(e.target.value)}
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  rows={4}
                  placeholder="Sorunuzu yazın..."
                />
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={formActive}
                  onChange={(e) => setFormActive(e.target.checked)}
                  className="h-5 w-5 rounded"
                />
                Aktif
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