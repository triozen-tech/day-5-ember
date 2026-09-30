"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { isRecord, seenEnough } from "./recordDemo";

// ?record=1 on laptops only (the engine hides the real cursor while filming; phones and tablets have no cursor and use
// the swipe hint instead). Once per section, a copper dot pops up in the right-hand margin at mid-height (never over
// the jug or the photos), grows into its label ("Pour", "Swipe", "Flip") for about a second, then disappears.
// Sections opt in with data-cursor-demo="Label".

export default function GhostCursor() {
  const [on, setOn] = useState(false);
  const dot = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");

  useEffect(() => setOn(isRecord() && window.matchMedia("(hover: hover) and (pointer: fine) and (min-width: 1024px)").matches), []);

  useEffect(() => {
    if (!on) return;
    const el = dot.current!;
    const queue: string[] = [];
    let busy = false;
    const play = (text: string) => {
      if (busy) return queue.push(text);
      busy = true;
      setLabel(text);
      // in the page margin (the container keeps ≥ 80px free at the sides on laptops)
      const x = window.innerWidth - 40;
      const y = window.innerHeight * 0.5;
      gsap
        .timeline({
          onComplete: () => {
            busy = false;
            const next = queue.shift();
            if (next) play(next);
          },
        })
        .set(el, { x, y, scale: 0.12, opacity: 0 })
        .to(el, { opacity: 1, scale: 0.72, duration: 0.3, ease: "power3.out" })
        .to(el, { scale: 0.12, opacity: 0, duration: 0.25, ease: "power2.in" }, "+=1");
    };
    const offs = Array.from(document.querySelectorAll<HTMLElement>("[data-cursor-demo]")).map((sec) => {
      const io = new IntersectionObserver(
        ([e]) => {
          if (seenEnough(e, 0.6)) {
            io.disconnect();
            play(sec.dataset.cursorDemo || "");
          }
        },
        { threshold: Array.from({ length: 21 }, (_, i) => i / 20) },
      );
      io.observe(sec);
      return () => io.disconnect();
    });
    return () => offs.forEach((f) => f());
  }, [on]);

  if (!on) return null;
  return (
    <div ref={dot} aria-hidden className="pointer-events-none fixed left-0 top-0 z-[95] -ml-[37px] -mt-[37px] grid h-[74px] w-[74px] place-items-center rounded-full bg-[#e0913f] opacity-0 shadow-[0_8px_30px_rgba(224,145,63,0.45)]">
      <span className="text-[15px] font-bold uppercase tracking-[0.12em] text-[#1b120c]">{label}</span>
    </div>
  );
}
