"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_MS = 90;

type WordByWordLineProps = {
  text: string;
  /** Delay between each word (ms). */
  wordDelayMs?: number;
  className?: string;
  /** Semantic tag (default `p`). */
  as?: "p" | "h1" | "h2" | "span";
  /** Called once when the last word has been revealed. */
  onComplete?: () => void;
  /** Optional accessible name (e.g. full sentence while words animate visually). */
  ariaLabel?: string;
  /** Tailwind duration class for each word’s opacity transition (default `duration-200`). */
  wordOpacityDurationClassName?: string;
  /**
   * When false, word reveal is paused (e.g. wait for a hero asset). When it becomes true,
   * the sequence starts from the first word.
   */
  startWhen?: boolean;
};

/**
 * Reveals words one after another for a lightweight “chat” feel.
 */
export function WordByWordLine({
  text,
  wordDelayMs = DEFAULT_MS,
  className,
  as: Tag = "p",
  onComplete,
  ariaLabel,
  wordOpacityDurationClassName = "duration-200",
  startWhen = true,
}: WordByWordLineProps) {
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean), [text]);
  const [visibleCount, setVisibleCount] = useState(0);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    completedRef.current = false;
    setVisibleCount(0);
    if (!startWhen) {
      return;
    }
    if (words.length === 0) {
      queueMicrotask(() => {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
      });
      return;
    }
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= words.length) {
        window.clearInterval(id);
      }
    }, wordDelayMs);
    return () => window.clearInterval(id);
  }, [wordDelayMs, words, startWhen]);

  useEffect(() => {
    if (words.length === 0) return;
    if (visibleCount < words.length) return;
    if (completedRef.current) return;
    completedRef.current = true;
    const id = window.requestAnimationFrame(() => {
      onCompleteRef.current?.();
    });
    return () => window.cancelAnimationFrame(id);
  }, [visibleCount, words.length]);

  return (
    <Tag className={className} aria-label={ariaLabel}>
      {words.map((word, idx) => (
        <span
          key={idx}
          className={`inline transition-opacity ${wordOpacityDurationClassName} ${
            idx < visibleCount ? "opacity-100" : "opacity-0"
          }`}
        >
          {word}
          {idx < words.length - 1 ? " " : ""}
        </span>
      ))}
    </Tag>
  );
}
