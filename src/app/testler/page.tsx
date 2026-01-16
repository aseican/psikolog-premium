"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Container } from "@/components/layout/Container";

type Role = "bot" | "user";

type Msg = {
  id: string;
  role: Role;
  text: string;
};

const QUESTIONS: string[] = [
  "Merhaba! Başlamadan önce: Bugün seni buraya getiren ana konu nedir?",
  "Bu durum ne zamandır devam ediyor?",
  "Son 2 haftada şikayetinin şiddeti 0–10 arası kaç olur?",
  "Günlük yaşamını en çok hangi alanlarda etkiliyor? (iş/okul/ilişki/uyku vb.)",
  "Daha önce benzer bir dönem yaşadın mı? Neler yardımcı olmuştu?",
  "Uyku düzenin nasıl? (ortalama saat ve kalite)",
  "İştah ve enerji durumun nasıl?",
  "Son zamanlarda yoğun kaygı/panik/çarpıntı gibi belirtiler yaşıyor musun?",
  "Yakın çevrenden destek alabiliyor musun? (aile/arkadaş/partner)",
  "Görüşmeden beklentin nedir? Ne değişsin istersin?",
];

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export default function TestlerPage() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: uid(),
      role: "bot",
      text: "Bu bölüm danışan ön-bilgi amaçlıdır. Cevapların kaydedilmez (demo). Başlayalım mı?",
    },
    { id: uid(), role: "bot", text: QUESTIONS[0] },
  ]);

  const [step, setStep] = useState(0); // 0..9
  const [input, setInput] = useState("");
  const [isDone, setIsDone] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);

  const progressText = useMemo(() => {
    const current = Math.min(step + 1, QUESTIONS.length);
    return `${current}/${QUESTIONS.length}`;
  }, [step]);

  useEffect(() => {
    // Auto-scroll to bottom on new message
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  function pushMessage(role: Role, text: string) {
    setMessages((prev) => [...prev, { id: uid(), role, text }]);
  }

  function handleSend() {
    const trimmed = input.trim();
    if (!trimmed || isDone) return;

    pushMessage("user", trimmed);
    setInput("");

    // Next bot question
    const nextStep = step + 1;

    if (nextStep >= QUESTIONS.length) {
      setIsDone(true);
      pushMessage(
        "bot",
        "Teşekkürler. Ön değerlendirme tamamlandı. İstersen bu cevaplarla randevu sayfasına geçebilirsin."
      );
      return;
    }

    setStep(nextStep);

    // small delay for a more “chatty” feel
    setTimeout(() => {
      pushMessage("bot", QUESTIONS[nextStep]);
    }, 300);
  }

  function handleReset() {
    setStep(0);
    setIsDone(false);
    setInput("");
    setMessages([
      {
        id: uid(),
        role: "bot",
        text: "Bu bölüm danışan ön-bilgi amaçlıdır. Cevapların kaydedilmez (demo). Başlayalım mı?",
      },
      { id: uid(), role: "bot", text: QUESTIONS[0] },
    ]);
  }

  return (
    <Container>
      <section className="rounded-3xl border bg-white p-6 md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Testler</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-700">
              Danışan ön-bilgi amaçlı kısa bir sohbet akışı. (Demo) Cevaplar
              kaydedilmez; sadece akışı göstermek için tasarlanmıştır.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/randevu"
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Randevu Al
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Sıfırla
            </button>
          </div>
        </div>

        {/* progress */}
        <div className="mt-6 flex items-center justify-between rounded-2xl border bg-slate-50 px-4 py-3">
          <div className="text-sm font-medium text-slate-700">
            İlerleme: {progressText}
          </div>
          <div className="h-2 w-40 overflow-hidden rounded-full border bg-white">
            <div
              className="h-full bg-slate-900"
              style={{
                width: `${((Math.min(step + 1, QUESTIONS.length)) / QUESTIONS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* chat */}
        <div
          ref={listRef}
          className="mt-6 h-[520px] overflow-auto rounded-3xl border bg-[#edf3f1] p-4 md:p-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className={[
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                ].join(" ")}
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

            {isDone && (
              <div className="mt-2 rounded-3xl border bg-white p-4 text-sm text-slate-700">
                <div className="font-medium text-slate-900">
                  Sonraki adım (öneri)
                </div>
                <ul className="mt-2 list-disc pl-5">
                  <li>Randevu sayfasına geçip uygun saat seçebilirsin.</li>
                  <li>
                    Backend geldiğinde bu cevaplar otomatik olarak danışmanlık
                    notlarına aktarılabilir.
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* input */}
        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_auto]">
          <input
            className="w-full rounded-2xl border bg-white px-4 py-3 text-sm"
            placeholder={
              isDone
                ? "Test tamamlandı. Sıfırla ile tekrar başlayabilirsin."
                : "Cevabını yaz…"
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
                ? "bg-slate-900/50 cursor-not-allowed"
                : "bg-slate-900 hover:bg-slate-800",
            ].join(" ")}
          >
            Gönder
          </button>
        </div>

        
      </section>
    </Container>
  );
}
