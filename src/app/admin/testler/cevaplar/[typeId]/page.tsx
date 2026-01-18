"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams } from "next/navigation";

type Response = {
  id: string;
  quiz_type_id: string;
  user_name: string | null;
  user_email: string | null;
  user_phone: string | null;
  answers: Record<string, string>;
  created_at: string;
};

type QuizType = {
  id: string;
  name: string;
  icon: string;
};

export default function AdminQuizResponsesPage() {
  const params = useParams();
  const typeId = params.typeId as string;

  const [loading, setLoading] = useState(true);
  const [quizType, setQuizType] = useState<QuizType | null>(null);
  const [responses, setResponses] = useState<Response[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeId]);

  async function loadData() {
    setLoading(true);
    setMsg(null);

    const [typeRes, responsesRes] = await Promise.all([
      supabase.from("quiz_types").select("id, name, icon").eq("id", typeId).single(),
      supabase
        .from("quiz_responses")
        .select("*")
        .eq("quiz_type_id", typeId)
        .order("created_at", { ascending: false }),
    ]);

    if (typeRes.error) {
      setMsg("Test türü bulunamadı: " + typeRes.error.message);
    } else {
      setQuizType(typeRes.data);
    }

    if (responsesRes.error) {
      setMsg("Hata: " + responsesRes.error.message);
    } else {
      setResponses(responsesRes.data ?? []);
    }

    setLoading(false);
  }

  async function deleteResponse(id: string) {
    if (!confirm("Bu cevabı silmek istediğinize emin misiniz?")) return;

    const { error } = await supabase.from("quiz_responses").delete().eq("id", id);

    if (error) {
      setMsg("Hata: " + error.message);
    } else {
      setMsg("Silindi ✅");
      loadData();
    }
  }

  function openDetailModal(response: Response) {
    setSelectedResponse(response);
    setShowDetailModal(true);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-900">Cevaplar</h1>
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

      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-900">
          {quizType.icon} {quizType.name} - Kullanıcı Cevapları
        </h1>
        <p className="mt-2 text-slate-600">
          Kullanıcıların bu teste verdiği cevapları görüntüleyin
        </p>
      </div>

      {msg && (
        <div className="mb-4 rounded-2xl border bg-blue-50 px-4 py-3 text-sm text-slate-700">
          {msg}
        </div>
      )}

      <div className="space-y-3">
        {responses.length === 0 ? (
          <div className="rounded-3xl border bg-white/60 p-8 text-center">
            <p className="text-slate-600">Henüz cevap yok</p>
          </div>
        ) : (
          responses.map((resp) => (
            <div
              key={resp.id}
              className="rounded-3xl border bg-white p-6 transition hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {resp.user_name || "Anonim"}
                  </h3>
                  <div className="mt-1 space-y-0.5 text-sm text-slate-600">
                    {resp.user_email && <p>📧 {resp.user_email}</p>}
                    {resp.user_phone && <p>📱 {resp.user_phone}</p>}
                    <p className="text-xs text-slate-500">
                      📅 {new Date(resp.created_at).toLocaleString("tr-TR")}
                    </p>
                  </div>
                  <div className="mt-3 text-sm text-slate-600">
                    {Object.keys(resp.answers).length} soru cevaplanmış
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => openDetailModal(resp)}
                    className="rounded-xl border bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    👁️ Detay
                  </button>

                  <button
                    onClick={() => deleteResponse(resp.id)}
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
      {showDetailModal && selectedResponse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-auto rounded-3xl border bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Cevap Detayı</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl p-2 text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {/* User Info */}
              <div className="rounded-2xl border bg-slate-50 p-4">
                <h3 className="text-sm font-medium text-slate-700">Kullanıcı Bilgileri</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p>
                    <span className="font-medium">İsim:</span>{" "}
                    {selectedResponse.user_name || "Belirtilmemiş"}
                  </p>
                  {selectedResponse.user_email && (
                    <p>
                      <span className="font-medium">Email:</span> {selectedResponse.user_email}
                    </p>
                  )}
                  {selectedResponse.user_phone && (
                    <p>
                      <span className="font-medium">Telefon:</span> {selectedResponse.user_phone}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    <span className="font-medium">Tarih:</span>{" "}
                    {new Date(selectedResponse.created_at).toLocaleString("tr-TR")}
                  </p>
                </div>
              </div>

              {/* Answers */}
              <div>
                <h3 className="text-sm font-medium text-slate-700">Sorular ve Cevaplar</h3>
                <div className="mt-3 space-y-4">
                  {Object.entries(selectedResponse.answers).map(([question, answer], idx) => (
                    <div key={idx} className="rounded-2xl border bg-white p-4">
                      <p className="text-sm font-medium text-slate-900">
                        {idx + 1}. {question}
                      </p>
                      <p className="mt-2 text-sm text-slate-700">{answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full rounded-2xl border px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}