"use client";

import { useEffect, useState } from "react";

export default function HeroWords({ words }: { words: string[] }) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    if (!words.length) return;

    const t = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 1800);

    return () => clearInterval(t);
  }, [words]);

  return (
    <span key={wordIndex} className="inline-block animate-heroFadeUp">
      {words[wordIndex]}
    </span>
  );
}
