"use client";

// Round 4 details must also play once by themselves while filming (?record=1), because nobody touches the mouse on
// camera. playOnceInView(el, fn) runs fn the first time el is at least `threshold` visible (or, for elements taller
// than the screen, fills at least `threshold` of the screen height), in record mode only.

const STEPS = Array.from({ length: 21 }, (_, i) => i / 20);
export const seenEnough = (e: IntersectionObserverEntry, threshold: number) =>
  e.intersectionRatio >= threshold || e.intersectionRect.height >= window.innerHeight * threshold;

export const isRecord = () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("record");

export function playOnceInView(el: Element | null, fn: () => void, threshold = 0.5, always = false) {
  if (!el || (!always && !isRecord())) return () => {};
  const io = new IntersectionObserver(
    ([e]) => {
      if (seenEnough(e, threshold)) {
        io.disconnect();
        fn();
      }
    },
    { threshold: STEPS },
  );
  io.observe(el);
  return () => io.disconnect();
}
