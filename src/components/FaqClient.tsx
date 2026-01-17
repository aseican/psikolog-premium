"use client";

import { useState } from "react";

type Faq = {
  id?: string;
  question?: string;
  answer?: string;
  q?: string;
  a?: string;
};

export default function FaqClient({ faqs }: { faqs: Faq[] }) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mt-6 divide-y divide-slate-200/60">
      {faqs.map((f, idx) => {
        const isOpen = openFaq === idx;
        const question = f.question ?? f.q ?? "";
        const answer = f.answer ?? f.a ?? "";

        return (
          <button
            key={idx}
            type="button"
            onClick={() => setOpenFaq(isOpen ? null : idx)}
            className="w-full text-left"
          >
            <div className="flex items-center justify-between py-5">
              <span className="text-sm font-medium text-slate-900 md:text-base">
                {question}
              </span>

              <span
                className={`ml-4 inline-flex h-6 w-6 items-center justify-center rounded-full border text-sm transition ${
                  isOpen
                    ? "rotate-45 border-slate-900 text-slate-900"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                +
              </span>
            </div>

            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr] pb-5" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl text-sm leading-relaxed text-slate-700">
                  {answer}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
