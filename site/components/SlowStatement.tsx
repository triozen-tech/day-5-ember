"use client";

import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { statement } from "../content";

// "From hill to cup" (Motion map M20 scroll-lit statement): the words sit dim and warm to crema one by one as you
// scroll (scrubbed, no pin, so phones get the same). Thin steam lines rise from the last word.
// X2 from the hero: the section overlaps the last 110vh of the hero (negative margin, transparent over the hero's
// espresso wash) and is a full screen with the text centred, so it rises in as the hero leaves; the first words
// start lighting the moment it enters. ?static=1: no overlap, every word lit.

export default function SlowStatement() {
  const root = useRef<HTMLElement>(null);
  const words = statement.text.split(" ");

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const el = root.current!;
    const ctx = gsap.context(() => {
      const w = gsap.utils.toArray<HTMLElement>(".lit-word");
      gsap.fromTo(
        w,
        { opacity: 0.16, color: "#c4ad92" },
        {
          opacity: 1,
          color: "#f4e9d8",
          ease: "none",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 85%", end: "center 35%", scrub: 0.6 },
        },
      );
      // steam: each line drifts up and fades, forever (supporting)
      gsap.utils.toArray<SVGPathElement>(".steam-line").forEach((p, i) => {
        gsap.fromTo(p, { y: 6, opacity: 0 }, { y: -10, opacity: 1, duration: 1.6, ease: "sine.inOut", repeat: -1, yoyo: true, delay: i * 0.8 });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="story" data-record-time="1.6" data-record-hold="0.4" data-record-align="center" data-record-label="Statement" className="statement relative z-[2] -mt-[110vh] flex min-h-screen items-center py-[12vh]">
      <div className="container-x">
        <p className="eyebrow mb-10 uppercase">{statement.eyebrow}</p>
        <p className="font-display max-w-[1180px] text-[clamp(34px,4.9vw,84px)] leading-[1.06]">
          {words.map((w, i) => (
            <span key={i} className="lit-word">
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
          <svg className="steam ml-3 inline-block h-[1.2em] w-[0.7em] -translate-y-[0.35em] overflow-visible align-baseline" viewBox="0 0 28 48" fill="none" aria-hidden>
            <path className="steam-line" d="M7 46c-4-6 4-10 0-17s4-11 0-18" stroke="#e0913f" strokeOpacity=".7" strokeWidth="1.6" strokeLinecap="round" />
            <path className="steam-line" d="M17 46c-4-6 4-10 0-17s4-11 0-18" stroke="#f4e9d8" strokeOpacity=".45" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </p>
      </div>
    </section>
  );
}
