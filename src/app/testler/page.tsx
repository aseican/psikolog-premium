"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { supabase } from "@/lib/supabase";

type QuizType = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type Question = {
  id: string;
  question: string;
  order_index: number;
};

type Role = "bot" | "user";

type Msg = {
  id: string;
  role: Role;
  text: string;
};

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function TestlerPage() {
  const [quizTypes, setQuizTypes] = useState<QuizType[]>([]);
  const [selectedType, setSelectedType] = useState<QuizType | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState("");
  const [isDone, setIsDone] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  // User info for saving
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [showUserInfoModal, setShowUserInfoModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadQuizTypes();
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function loadQuizTypes() {
    setLoading(true);
    const { data } = await supabase
      .from("quiz_types")
      .select("id, name, description, icon")
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    setQuizTypes(data ?? []);
    setLoading(false);
  }

  async function selectQuizType(type: QuizType) {
    setSelectedType(type);

    const { data } = await supabase
      .from("quiz_questions")
      .select("id, question, order_index")
      .eq("quiz_type_id", type.id)
      .eq("is_active", true)
      .order("order_index", { ascending: true });

    setQuestions(data ?? []);
    setStep(0);
    setIsDone(false);
    setInput("");
    setAnswers({});

    const welcomeMsg = `Merhaba! ${type.name} için hazırlanmış sorularımız var. Cevapların kaydedilir ve değerlendirme için kullanılır. Başlayalım mı?`;

    setMessages([
      { id: uid(), role: "bot", text: welcomeMsg },
      { id: uid(), role: "bot", text: data?.[0]?.question ?? "Soru yüklenemedi" },
    ]);
  }

  function pushMessage(role: Role, text: string) {
    setMessages((prev) => [...prev, { id: uid(), role, text }]);
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isDone) return;

    const currentQuestion = questions[step].question;

    pushMessage("user", trimmed);
    setAnswers((prev) => ({ ...prev, [currentQuestion]: trimmed }));
    setInput("");

    const nextStep = step + 1;

    if (nextStep >= questions.length) {
      setIsDone(true);
      pushMessage(
        "bot",
        "Teşekkürler! Tüm soruları tamamladın. Cevaplarını kaydetmek ister misin?"
      );
      return;
    }

    setStep(nextStep);

    setTimeout(() => {
      pushMessage("bot", questions[nextStep].question);
    }, 300);
  }

  function handleReset() {
    setSelectedType(null);
    setQuestions([]);
    setStep(0);
    setIsDone(false);
    setInput("");
    setMessages([]);
    setAnswers({});
  }

  async function handleSaveResponses() {
    if (!selectedType) return;

    setShowUserInfoModal(true);
  }

  async function submitResponses() {
    if (!selectedType) return;

    setSaving(true);

    const { error } = await supabase.from("quiz_responses").insert([
      {
        quiz_type_id: selectedType.id,
        user_name: userName.trim() || null,
        user_email: userEmail.trim() || null,
        user_phone: userPhone.trim() || null,
        answers: answers,
      },
    ]);

    setSaving(false);

    if (error) {
      alert("Kaydedilemedi: " + error.message);
    } else {
      setShowUserInfoModal(false);
      pushMessage("bot", "Cevapların kaydedildi! Teşekkürler. 🎉");
    }
  }

  const progressText = useMemo(() => {
    if (!questions.length) return "0/0";
    const current = Math.min(step + 1, questions.length);
    return `${current}/${questions.length}`;
  }, [step, questions.length]);

  if (loading) {
    return (
      <Container>
        <section className="rounded-3xl border bg-white p-6 md:p-8">
          <p className="text-slate-600">Yükleniyor...</p>
        </section>
      </Container>
    );
  }

  if (!selectedType) {
    return (
      <Container>
        <section className="rounded-3xl border bg-white p-6 md:p-8">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Testler</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-700">
              Hangi konuda değerlendirme yapmak istediğinizi seçin
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => selectQuizType(type)}
                className="rounded-3xl border bg-slate-50/50 p-6 text-left transition hover:bg-slate-100/50 hover:shadow-md"
              >
                <div className="text-4xl">{type.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{type.name}</h3>
                <p className="mt-1 text-sm text-slate-600">{type.description}</p>
              </button>
            ))}
          </div>
        </section>
      </Container>
    );
  }

  return (
    <Container>
      <section className="rounded-3xl border bg-white p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {selectedType.icon} {selectedType.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-700">
              {selectedType.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {isDone && (
              <button
                type="button"
                onClick={handleSaveResponses}
                className="rounded-2xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                💾 Cevapları Kaydet
              </button>
            )}
            <Link
              href="/randevu"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Randevu Oluştur
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              ← Geri
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3">
          <div className="text-sm font-medium text-slate-700">İlerleme: {progressText}</div>
          <div className="h-2 w-40 overflow-hidden rounded-full border bg-white">
            <div
              className="h-full bg-slate-900 transition-all"
              style={{
                width: `${questions.length
                    ? ((Math.min(step + 1, questions.length)) / questions.length) * 100
                    : 0
                  }%`,
              }}
            />
          </div>
        </div>

        {/* Chat */}
        <div
          ref={listRef}
          className="mt-6 h-[520px] overflow-auto rounded-3xl border bg-[#edf3f1] p-4 md:p-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={["flex", m.role === "user" ? "justify-end" : "justify-start"].join(" ")}
              >
                <div
                  className={[
                    "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-6 shadow-sm",
                    m.role === "user"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-900",
                  ].join(" ")}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="w-full rounded-2xl border bg-white px-4 py-3 text-sm"
            placeholder={
              isDone ? "Test tamamlandı. Cevaplarını kaydedebilirsin." : "Cevabını yaz…"
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            disabled={isDone}
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isDone || input.trim().length === 0}
            className={[
              "rounded-2xl px-5 py-3 text-sm font-medium text-white transition",
              isDone || input.trim().length === 0
                ? "cursor-not-allowed bg-slate-900/50"
                : "bg-slate-900 hover:bg-slate-800",
            ].join(" ")}
          >
            Gönder
          </button>
        </div>
      </section>

      {/* User Info Modal */}
      {showUserInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl border bg-white p-6">
            <h2 className="text-xl font-semibold text-slate-900">İletişim Bilgileri</h2>
            <p className="mt-2 text-sm text-slate-600">
              Cevaplarınızı kaydetmek için iletişim bilgilerinizi paylaşın (opsiyonel)
            </p>

            <div className="mt-6 space-y-4">
              <label className="block text-sm text-slate-700">
                İsim
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  placeholder="İsminiz"
                />
              </label>

              <label className="block text-sm text-slate-700">
                Email
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  placeholder="email@ornek.com"
                />
              </label>

              <label className="block text-sm text-slate-700">
                Telefon
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="mt-2 w-full rounded-2xl border px-4 py-3 text-sm"
                  placeholder="0532 123 4567"
                />
              </label>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={submitResponses}
                disabled={saving}
                className="flex-1 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Kaydet"}
              </button>
              <button
                onClick={() => setShowUserInfoModal(false)}
                className="rounded-2xl border px-5 py-3 text-sm text-slate-700 hover:bg-slate-50"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}